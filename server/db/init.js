const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'minimayhem',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function initializeDatabase() {
  try {
    // Create extensions
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_banned BOOLEAN DEFAULT FALSE,
        ban_reason TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        coins INTEGER DEFAULT 1000
      );
    `);

    // Create player_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar_url VARCHAR(500),
        skin_id VARCHAR(50) DEFAULT 'default',
        title VARCHAR(100),
        bio TEXT,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        playtime_seconds INTEGER DEFAULT 0,
        rank VARCHAR(50) DEFAULT 'Bronze'
      );
    `);

    // Create rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_code VARCHAR(10) UNIQUE NOT NULL,
        host_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_private BOOLEAN DEFAULT FALSE,
        max_players INTEGER DEFAULT 8,
        current_players INTEGER DEFAULT 0,
        game_mode VARCHAR(50) DEFAULT 'free_for_all',
        map_id VARCHAR(50) DEFAULT 'toy_bedroom',
        status VARCHAR(50) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        password_hash VARCHAR(255)
      );
    `);

    // Create room_players table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team VARCHAR(50),
        is_ready BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      );
    `);

    // Create weapons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weapons (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        damage INTEGER NOT NULL,
        fire_rate DECIMAL NOT NULL,
        magazine_size INTEGER NOT NULL,
        reload_time DECIMAL NOT NULL,
        range INTEGER NOT NULL,
        is_unlocked BOOLEAN DEFAULT TRUE,
        unlock_level INTEGER DEFAULT 1,
        cost INTEGER DEFAULT 0
      );
    `);

    // Create player_weapons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_weapons (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        weapon_id VARCHAR(50) REFERENCES weapons(id) ON DELETE CASCADE,
        is_equipped BOOLEAN DEFAULT FALSE,
        skin_id VARCHAR(50) DEFAULT 'default',
        xp INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, weapon_id)
      );
    `);

    // Create matches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
        game_mode VARCHAR(50) NOT NULL,
        map_id VARCHAR(50) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        duration_seconds INTEGER
      );
    `);

    // Create match_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS match_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team VARCHAR(50),
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        damage_dealt INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        placement INTEGER
      );
    `);

    // Create friends table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, friend_id),
        CHECK (user_id != friend_id)
      );
    `);

    // Create inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_type, item_id)
      );
    `);

    // Insert default weapons
    await pool.query(`
      INSERT INTO weapons (id, name, type, damage, fire_rate, magazine_size, reload_time, range, is_unlocked, unlock_level, cost)
      VALUES 
        ('pistol', 'Pistol', 'secondary', 25, 0.5, 12, 1.5, 300, true, 1, 0),
        ('shotgun', 'Shotgun', 'primary', 80, 0.8, 8, 2.5, 150, true, 1, 0),
        ('smg', 'SMG', 'primary', 15, 0.1, 30, 2.0, 250, true, 1, 0),
        ('assault_rifle', 'Assault Rifle', 'primary', 30, 0.15, 30, 2.2, 400, true, 3, 500),
        ('sniper', 'Sniper Rifle', 'primary', 100, 1.0, 5, 3.0, 600, true, 5, 1000),
        ('rocket_launcher', 'Rocket Launcher', 'heavy', 150, 2.0, 3, 4.0, 500, false, 10, 2000),
        ('grenade', 'Grenade', 'throwable', 100, 0.5, 5, 1.0, 200, true, 2, 300),
        ('laser_gun', 'Laser Gun', 'special', 20, 0.05, 50, 1.5, 350, false, 8, 1500),
        ('plasma_weapon', 'Plasma Weapon', 'special', 40, 0.2, 25, 2.0, 400, false, 12, 2500)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };
