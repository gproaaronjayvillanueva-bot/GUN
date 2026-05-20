const express = require('express');
const { pool } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get available maps
router.get('/maps', async (req, res) => {
  try {
    const maps = [
      {
        id: 'toy_bedroom',
        name: 'Toy Bedroom',
        description: 'A miniature battlefield in a child\'s bedroom',
        maxPlayers: 8,
        thumbnail: '/maps/toy-bedroom.png'
      },
      {
        id: 'kitchen_warzone',
        name: 'Kitchen Warzone',
        description: 'Epic battles among kitchen appliances',
        maxPlayers: 8,
        thumbnail: '/maps/kitchen-warzone.png'
      },
      {
        id: 'backyard_battleground',
        name: 'Backyard Battleground',
        description: 'Outdoor combat in the garden',
        maxPlayers: 10,
        thumbnail: '/maps/backyard-battleground.png'
      },
      {
        id: 'mini_city',
        name: 'Mini City',
        description: 'Urban warfare in a toy city',
        maxPlayers: 12,
        thumbnail: '/maps/mini-city.png'
      },
      {
        id: 'space_station',
        name: 'Space Toy Station',
        description: 'Zero-gravity battles in space',
        maxPlayers: 8,
        thumbnail: '/maps/space-station.png'
      }
    ];

    res.json({ maps });
  } catch (error) {
    console.error('Get maps error:', error);
    res.status(500).json({ error: 'Failed to get maps' });
  }
});

// Get game modes
router.get('/modes', async (req, res) => {
  try {
    const modes = [
      {
        id: 'free_for_all',
        name: 'Free For All',
        description: 'Every player for themselves',
        maxPlayers: 8,
        teams: false
      },
      {
        id: 'team_deathmatch',
        name: 'Team Deathmatch',
        description: 'Red vs Blue team battle',
        maxPlayers: 8,
        teams: true
      },
      {
        id: 'capture_the_flag',
        name: 'Capture The Flag',
        description: 'Capture the enemy flag',
        maxPlayers: 8,
        teams: true
      },
      {
        id: 'gun_game',
        name: 'Gun Game',
        description: 'Progress through weapons with kills',
        maxPlayers: 8,
        teams: false
      },
      {
        id: 'battle_royale',
        name: 'Battle Royale Mini',
        description: 'Last player standing wins',
        maxPlayers: 12,
        teams: false
      },
      {
        id: 'zombie_survival',
        name: 'Zombie Survival',
        description: 'Survive against zombie waves',
        maxPlayers: 4,
        teams: true
      },
      {
        id: 'king_of_the_hill',
        name: 'King Of The Hill',
        description: 'Control the hill to score points',
        maxPlayers: 8,
        teams: true
      }
    ];

    res.json({ modes });
  } catch (error) {
    console.error('Get modes error:', error);
    res.status(500).json({ error: 'Failed to get game modes' });
  }
});

// Get match history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const result = await pool.query(
      `SELECT m.*, mr.kills, mr.deaths, mr.assists, mr.damage_dealt, mr.score, mr.placement
       FROM matches m
       JOIN match_results mr ON m.id = mr.match_id
       WHERE mr.user_id = $1
       ORDER BY m.started_at DESC
       LIMIT $2`,
      [userId, parseInt(limit)]
    );

    res.json({ matches: result.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get match history' });
  }
});

// Save match result
router.post('/match/result', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roomId, gameMode, mapId, duration, kills, deaths, assists, damage, score, placement } = req.body;

    // Create match record
    const matchResult = await pool.query(
      `INSERT INTO matches (room_id, game_mode, map_id, duration_seconds, ended_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [roomId, gameMode, mapId, duration]
    );

    const matchId = matchResult.rows[0].id;

    // Create match result
    await pool.query(
      `INSERT INTO match_results (match_id, user_id, kills, deaths, assists, damage_dealt, score, placement)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [matchId, userId, kills, deaths, assists, damage, score, placement]
    );

    // Update player stats
    await pool.query(
      `UPDATE player_profiles
       SET kills = kills + $1,
           deaths = deaths + $2,
           wins = wins + $3
       WHERE user_id = $4`,
      [kills, deaths, placement === 1 ? 1 : 0, userId]
    );

    // Update user XP
    const xpGained = (kills * 100) + (assists * 50) + (placement === 1 ? 500 : 0);
    await pool.query(
      `UPDATE users
       SET xp = xp + $1,
           coins = coins + $2
       WHERE id = $3`,
      [xpGained, Math.floor(xpGained / 10), userId]
    );

    res.json({ message: 'Match result saved', xpGained });
  } catch (error) {
    console.error('Save match result error:', error);
    res.status(500).json({ error: 'Failed to save match result' });
  }
});

// Get inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM inventory WHERE user_id = $1 ORDER BY acquired_at DESC',
      [userId]
    );

    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

// Get battle pass
router.get('/battlepass', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user level
    const userResult = await pool.query('SELECT level, xp FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Generate battle pass rewards
    const rewards = [];
    for (let i = 1; i <= 100; i++) {
      rewards.push({
        level: i,
        unlocked: i <= user.level,
        reward: i % 10 === 0 ? { type: 'weapon_skin', id: `legendary_${i}` } : 
                 i % 5 === 0 ? { type: 'emote', id: `emote_${i}` } :
                 { type: 'coins', amount: i * 100 }
      });
    }

    res.json({ 
      currentLevel: user.level,
      currentXP: user.xp,
      rewards 
    });
  } catch (error) {
    console.error('Get battle pass error:', error);
    res.status(500).json({ error: 'Failed to get battle pass' });
  }
});

module.exports = router;
