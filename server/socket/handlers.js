const jwt = require('jsonwebtoken');
const { pool } = require('../db/init');

// Store active rooms and players
const activeRooms = new Map();
const playerSockets = new Map();

function setupSocketHandlers(io) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.username} (${socket.userId})`);
    playerSockets.set(socket.userId, socket);

    // Join room
    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;

        // Verify player is in the room
        const roomPlayer = await pool.query(
          'SELECT * FROM room_players WHERE room_id = $1 AND user_id = $2',
          [roomId, socket.userId]
        );

        if (roomPlayer.rows.length === 0) {
          socket.emit('error', { message: 'Not in this room' });
          return;
        }

        socket.join(roomId);
        socket.roomId = roomId;

        // Get room info
        const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
        const room = roomResult.rows[0];

        // Initialize room if not exists
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, {
            id: roomId,
            players: new Map(),
            gameState: 'waiting',
            gameMode: room.game_mode,
            mapId: room.map_id,
            bullets: [],
            powerups: [],
            startTime: null
          });
        }

        const roomData = activeRooms.get(roomId);

        // Add player to room
        roomData.players.set(socket.userId, {
          id: socket.userId,
          username: socket.username,
          x: 0,
          y: 0,
          rotation: 0,
          health: 100,
          armor: 0,
          weapon: 'pistol',
          ammo: 12,
          team: roomPlayer.rows[0].team,
          kills: 0,
          deaths: 0,
          isAlive: true
        });

        // Notify other players
        socket.to(roomId).emit('player_joined', {
          playerId: socket.userId,
          username: socket.username,
          team: roomPlayer.rows[0].team
        });

        // Send current room state to new player
        const players = Array.from(roomData.players.values());
        socket.emit('room_state', {
          players,
          gameState: roomData.gameState,
          gameMode: roomData.gameMode,
          mapId: roomData.mapId
        });

        console.log(`${socket.username} joined room ${roomId}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Player movement
    socket.on('player_move', (data) => {
      try {
        const { x, y, rotation } = data;
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(socket.userId)) {
          const player = roomData.players.get(socket.userId);
          player.x = x;
          player.y = y;
          player.rotation = rotation;

          // Broadcast to other players
          socket.to(socket.roomId).emit('player_moved', {
            playerId: socket.userId,
            x,
            y,
            rotation
          });
        }
      } catch (error) {
        console.error('Player move error:', error);
      }
    });

    // Player shoot
    socket.on('player_shoot', (data) => {
      try {
        const { startX, startY, targetX, targetY, weapon } = data;
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(socket.userId)) {
          const bulletId = `bullet_${Date.now()}_${socket.userId}`;
          const angle = Math.atan2(targetY - startY, targetX - startX);

          roomData.bullets.push({
            id: bulletId,
            ownerId: socket.userId,
            x: startX,
            y: startY,
            angle,
            speed: getWeaponSpeed(weapon),
            damage: getWeaponDamage(weapon),
            weapon
          });

          // Broadcast to all players
          io.to(socket.roomId).emit('bullet_fired', {
            bulletId,
            ownerId: socket.userId,
            startX,
            startY,
            targetX,
            targetY,
            weapon
          });
        }
      } catch (error) {
        console.error('Player shoot error:', error);
      }
    });

    // Player hit
    socket.on('player_hit', (data) => {
      try {
        const { targetId, damage } = data;
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(targetId)) {
          const target = roomData.players.get(targetId);
          target.health -= damage;

          if (target.health <= 0) {
            target.health = 0;
            target.isAlive = false;

            // Update killer stats
            if (roomData.players.has(socket.userId)) {
              const killer = roomData.players.get(socket.userId);
              killer.kills++;
            }

            target.deaths++;

            // Broadcast death
            io.to(socket.roomId).emit('player_died', {
              playerId: targetId,
              killerId: socket.userId
            });

            // Check win condition
            checkWinCondition(socket.roomId, roomData);
          } else {
            // Broadcast damage
            io.to(socket.roomId).emit('player_damaged', {
              playerId: targetId,
              damage,
              health: target.health
            });
          }
        }
      } catch (error) {
        console.error('Player hit error:', error);
      }
    });

    // Player respawn
    socket.on('player_respawn', () => {
      try {
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(socket.userId)) {
          const player = roomData.players.get(socket.userId);
          player.health = 100;
          player.isAlive = true;
          player.x = getRandomSpawnPosition();
          player.y = getRandomSpawnPosition();

          io.to(socket.roomId).emit('player_respawned', {
            playerId: socket.userId,
            x: player.x,
            y: player.y
          });
        }
      } catch (error) {
        console.error('Player respawn error:', error);
      }
    });

    // Weapon switch
    socket.on('switch_weapon', (data) => {
      try {
        const { weapon } = data;
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(socket.userId)) {
          const player = roomData.players.get(socket.userId);
          player.weapon = weapon;
          player.ammo = getWeaponAmmo(weapon);

          socket.to(socket.roomId).emit('weapon_switched', {
            playerId: socket.userId,
            weapon
          });
        }
      } catch (error) {
        console.error('Switch weapon error:', error);
      }
    });

    // Reload
    socket.on('reload', () => {
      try {
        const roomData = activeRooms.get(socket.roomId);

        if (roomData && roomData.players.has(socket.userId)) {
          const player = roomData.players.get(socket.userId);
          player.ammo = getWeaponAmmo(player.weapon);

          socket.to(socket.roomId).emit('player_reloaded', {
            playerId: socket.userId
          });
        }
      } catch (error) {
        console.error('Reload error:', error);
      }
    });

    // Start game
    socket.on('start_game', async () => {
      try {
        const roomData = activeRooms.get(socket.roomId);

        if (roomData) {
          // Check if player is host
          const roomResult = await pool.query(
            'SELECT * FROM rooms WHERE id = $1 AND host_id = $2',
            [socket.roomId, socket.userId]
          );

          if (roomResult.rows.length === 0) {
            socket.emit('error', { message: 'Only host can start game' });
            return;
          }

          // Check if all players are ready
          const playersResult = await pool.query(
            'SELECT * FROM room_players WHERE room_id = $1',
            [socket.roomId]
          );

          const allReady = playersResult.rows.every(p => p.is_ready);

          if (!allReady) {
            socket.emit('error', { message: 'Not all players are ready' });
            return;
          }

          // Start game
          roomData.gameState = 'playing';
          roomData.startTime = Date.now();

          // Reset player positions
          roomData.players.forEach((player, playerId) => {
            player.x = getRandomSpawnPosition();
            player.y = getRandomSpawnPosition();
            player.health = 100;
            player.isAlive = true;
            player.kills = 0;
            player.deaths = 0;
          });

          // Update room status in database
          await pool.query(
            'UPDATE rooms SET status = $1 WHERE id = $2',
            ['playing', socket.roomId]
          );

          io.to(socket.roomId).emit('game_started', {
            mapId: roomData.mapId,
            gameMode: roomData.gameMode
          });

          console.log(`Game started in room ${socket.roomId}`);
        }
      } catch (error) {
        console.error('Start game error:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Chat message
    socket.on('chat_message', (data) => {
      try {
        const { message } = data;

        io.to(socket.roomId).emit('chat_message', {
          playerId: socket.userId,
          username: socket.username,
          message,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Chat message error:', error);
      }
    });

    // Emote
    socket.on('emote', (data) => {
      try {
        const { emoteId } = data;

        socket.to(socket.roomId).emit('player_emote', {
          playerId: socket.userId,
          emoteId
        });
      } catch (error) {
        console.error('Emote error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        console.log(`Player disconnected: ${socket.username}`);

        playerSockets.delete(socket.userId);

        if (socket.roomId) {
          const roomData = activeRooms.get(socket.roomId);

          if (roomData) {
            roomData.players.delete(socket.userId);

            socket.to(socket.roomId).emit('player_left', {
              playerId: socket.userId
            });

            // Clean up empty rooms
            if (roomData.players.size === 0) {
              activeRooms.delete(socket.roomId);
              await pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['waiting', socket.roomId]);
            }
          }

          socket.leave(socket.roomId);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
}

function getWeaponDamage(weapon) {
  const damages = {
    pistol: 25,
    shotgun: 80,
    smg: 15,
    assault_rifle: 30,
    sniper: 100,
    rocket_launcher: 150,
    grenade: 100,
    laser_gun: 20,
    plasma_weapon: 40
  };
  return damages[weapon] || 25;
}

function getWeaponSpeed(weapon) {
  const speeds = {
    pistol: 15,
    shotgun: 12,
    smg: 18,
    assault_rifle: 16,
    sniper: 25,
    rocket_launcher: 8,
    grenade: 10,
    laser_gun: 30,
    plasma_weapon: 20
  };
  return speeds[weapon] || 15;
}

function getWeaponAmmo(weapon) {
  const ammo = {
    pistol: 12,
    shotgun: 8,
    smg: 30,
    assault_rifle: 30,
    sniper: 5,
    rocket_launcher: 3,
    grenade: 5,
    laser_gun: 50,
    plasma_weapon: 25
  };
  return ammo[weapon] || 12;
}

function getRandomSpawnPosition() {
  return Math.floor(Math.random() * 800) + 100;
}

function checkWinCondition(roomId, roomData) {
  const alivePlayers = Array.from(roomData.players.values()).filter(p => p.isAlive);

  if (alivePlayers.length <= 1) {
    // Game over
    const winner = alivePlayers[0];
    
    io.to(roomId).emit('game_ended', {
      winner: winner ? { id: winner.id, username: winner.username, kills: winner.kills } : null,
      players: Array.from(roomData.players.values())
    });

    // Update room status
    roomData.gameState = 'ended';
    pool.query('UPDATE rooms SET status = $1 WHERE id = $2', ['waiting', roomId]);
  }
}

module.exports = { setupSocketHandlers };
