const express = require('express');
const { pool } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get player profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT u.*, pp.* 
       FROM users u
       LEFT JOIN player_profiles pp ON u.id = pp.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ player: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update player profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatarUrl, skinId, title, bio } = req.body;

    await pool.query(
      `UPDATE player_profiles 
       SET avatar_url = COALESCE($1, avatar_url),
           skin_id = COALESCE($2, skin_id),
           title = COALESCE($3, title),
           bio = COALESCE($4, bio)
       WHERE user_id = $5`,
      [avatarUrl, skinId, title, bio, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get player stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM player_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    // Calculate K/D ratio
    const stats = result.rows[0];
    const kdRatio = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
    const winRate = (stats.wins + stats.losses) > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : '0.0';

    res.json({
      stats: {
        ...stats,
        kd_ratio: parseFloat(kdRatio),
        win_rate: parseFloat(winRate)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, sortBy = 'xp' } = req.query;

    let orderBy;
    switch (sortBy) {
      case 'kills':
        orderBy = 'pp.kills DESC';
        break;
      case 'wins':
        orderBy = 'pp.wins DESC';
        break;
      case 'kd':
        orderBy = 'CASE WHEN pp.deaths = 0 THEN pp.kills ELSE (pp.kills::float / pp.deaths) END DESC';
        break;
      default:
        orderBy = 'u.xp DESC';
    }

    const result = await pool.query(
      `SELECT u.id, u.username, pp.avatar_url, u.xp, u.level, pp.kills, pp.deaths, pp.wins, pp.losses
       FROM users u
       LEFT JOIN player_profiles pp ON u.id = pp.user_id
       WHERE u.is_banned = false
       ORDER BY ${orderBy}
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get player weapons
router.get('/weapons', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT w.*, pw.is_equipped, pw.skin_id, pw.xp as weapon_xp
       FROM weapons w
       LEFT JOIN player_weapons pw ON w.id = pw.weapon_id AND pw.user_id = $1
       ORDER BY w.type, w.name`,
      [userId]
    );

    res.json({ weapons: result.rows });
  } catch (error) {
    console.error('Get weapons error:', error);
    res.status(500).json({ error: 'Failed to get weapons' });
  }
});

// Equip weapon
router.post('/weapons/equip', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weaponId } = req.body;

    // Unequip all weapons of same type
    await pool.query(
      `UPDATE player_weapons pw
       SET is_equipped = false
       FROM weapons w
       WHERE pw.user_id = $1 AND pw.weapon_id = w.id AND w.type = (SELECT type FROM weapons WHERE id = $2)`,
      [userId, weaponId]
    );

    // Equip selected weapon
    await pool.query(
      `INSERT INTO player_weapons (user_id, weapon_id, is_equipped)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id, weapon_id) DO UPDATE SET is_equipped = true`,
      [userId, weaponId]
    );

    res.json({ message: 'Weapon equipped successfully' });
  } catch (error) {
    console.error('Equip weapon error:', error);
    res.status(500).json({ error: 'Failed to equip weapon' });
  }
});

// Get friends
router.get('/friends', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT f.status, f.created_at,
       CASE 
         WHEN f.user_id = $1 THEN u2.id, u2.username, u2.level, pp.avatar_url
         ELSE u1.id, u1.username, u1.level, pp.avatar_url
       END as friend_id, friend_username, friend_level, friend_avatar
       FROM friends f
       JOIN users u1 ON f.user_id = u1.id
       JOIN users u2 ON f.friend_id = u2.id
       LEFT JOIN player_profiles pp ON CASE WHEN f.user_id = $1 THEN u2.id ELSE u1.id END = pp.user_id
       WHERE f.user_id = $1 OR f.friend_id = $1`,
      [userId]
    );

    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// Add friend
router.post('/friends/add', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.body;

    await pool.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, $3)',
      [userId, friendId, 'pending']
    );

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Accept friend
router.post('/friends/accept/:friendId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.params;

    await pool.query(
      'UPDATE friends SET status = $1 WHERE user_id = $2 AND friend_id = $3',
      ['accepted', friendId, userId]
    );

    res.json({ message: 'Friend accepted' });
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ error: 'Failed to accept friend' });
  }
});

module.exports = router;
