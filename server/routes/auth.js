const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/init');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    // Create player profile
    await pool.query(
      'INSERT INTO player_profiles (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    // Generate token
    const token = generateToken(result.rows[0].id, result.rows[0].username);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account is banned', reason: user.ban_reason });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id, user.username);

    // Get player profile
    const profileResult = await pool.query(
      'SELECT * FROM player_profiles WHERE user_id = $1',
      [user.id]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        profile: profileResult.rows[0] || null
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

    const result = await pool.query(
      'SELECT id, username, email, xp, level, coins, created_at, last_login FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileResult = await pool.query(
      'SELECT * FROM player_profiles WHERE user_id = $1',
      [decoded.userId]
    );

    res.json({
      user: result.rows[0],
      profile: profileResult.rows[0] || null
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
