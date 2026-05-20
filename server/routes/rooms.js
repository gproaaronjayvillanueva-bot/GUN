const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create room
router.post('/', auth, async (req, res) => {
  try {
    const { name, isPrivate, maxPlayers, gameMode, mapId, password } = req.body;
    const userId = req.user.userId;

    const roomCode = generateRoomCode();
    let passwordHash = null;

    if (isPrivate && password) {
      const bcrypt = require('bcryptjs');
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `INSERT INTO rooms (room_code, host_id, name, is_private, max_players, game_mode, map_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [roomCode, userId, name || 'New Room', isPrivate || false, maxPlayers || 8, gameMode || 'free_for_all', mapId || 'toy_bedroom', passwordHash]
    );

    // Add host as first player
    await pool.query(
      'INSERT INTO room_players (room_id, user_id, team, is_ready) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, userId, 'red', true]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room: result.rows[0]
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get all public rooms
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username as host_username, 
       (SELECT COUNT(*) FROM room_players WHERE room_id = r.id) as player_count
       FROM rooms r
       JOIN users u ON r.host_id = u.id
       WHERE r.is_private = false AND r.status = 'waiting'
       ORDER BY r.created_at DESC`
    );

    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

// Get room by code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.username as host_username,
       (SELECT COUNT(*) FROM room_players WHERE room_id = r.id) as player_count
       FROM rooms r
       JOIN users u ON r.host_id = u.id
       WHERE r.room_code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get players in room
    const playersResult = await pool.query(
      `SELECT rp.*, u.username, pp.avatar_url
       FROM room_players rp
       JOIN users u ON rp.user_id = u.id
       LEFT JOIN player_profiles pp ON u.id = pp.user_id
       WHERE rp.room_id = $1`,
      [result.rows[0].id]
    );

    res.json({
      room: result.rows[0],
      players: playersResult.rows
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Join room
router.post('/:roomId/join', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password, team } = req.body;
    const userId = req.user.userId;

    // Get room
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Check if room is full
    const playerCount = await pool.query(
      'SELECT COUNT(*) FROM room_players WHERE room_id = $1',
      [roomId]
    );

    if (parseInt(playerCount.rows[0].count) >= room.max_players) {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Check password if private
    if (room.is_private && room.password_hash) {
      const bcrypt = require('bcryptjs');
      if (!password) {
        return res.status(401).json({ error: 'Password required' });
      }
      const validPassword = await bcrypt.compare(password, room.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    // Check if already in room
    const existingPlayer = await pool.query(
      'SELECT * FROM room_players WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (existingPlayer.rows.length > 0) {
      return res.status(400).json({ error: 'Already in room' });
    }

    // Add player to room
    await pool.query(
      'INSERT INTO room_players (room_id, user_id, team, is_ready) VALUES ($1, $2, $3, $4)',
      [roomId, userId, team || 'red', false]
    );

    // Update player count
    await pool.query(
      'UPDATE rooms SET current_players = current_players + 1 WHERE id = $1',
      [roomId]
    );

    res.json({ message: 'Joined room successfully' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Leave room
router.post('/:roomId/leave', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    await pool.query(
      'DELETE FROM room_players WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    // Update player count
    await pool.query(
      'UPDATE rooms SET current_players = current_players - 1 WHERE id = $1',
      [roomId]
    );

    // Check if room is empty, delete if so
    const playerCount = await pool.query(
      'SELECT COUNT(*) FROM room_players WHERE room_id = $1',
      [roomId]
    );

    if (parseInt(playerCount.rows[0].count) === 0) {
      await pool.query('DELETE FROM rooms WHERE id = $1', [roomId]);
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Update ready status
router.post('/:roomId/ready', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { isReady } = req.body;
    const userId = req.user.userId;

    await pool.query(
      'UPDATE room_players SET is_ready = $1 WHERE room_id = $2 AND user_id = $3',
      [isReady, roomId, userId]
    );

    res.json({ message: 'Ready status updated' });
  } catch (error) {
    console.error('Update ready error:', error);
    res.status(500).json({ error: 'Failed to update ready status' });
  }
});

// Kick player (host only)
router.post('/:roomId/kick/:userId', auth, async (req, res) => {
  try {
    const { roomId, userId: targetUserId } = req.params;
    const userId = req.user.userId;

    // Check if requester is host
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    
    if (roomResult.rows[0].host_id !== userId) {
      return res.status(403).json({ error: 'Only host can kick players' });
    }

    await pool.query(
      'DELETE FROM room_players WHERE room_id = $1 AND user_id = $2',
      [roomId, targetUserId]
    );

    res.json({ message: 'Player kicked' });
  } catch (error) {
    console.error('Kick player error:', error);
    res.status(500).json({ error: 'Failed to kick player' });
  }
});

module.exports = router;
