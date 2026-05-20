# Mini Mayhem Arena

A modern browser-based multiplayer gun battle game where players can create rooms, host matches, and invite friends through shareable links. Built with React, Next.js, Socket.IO, Phaser.js, and PostgreSQL.

## 🎮 Features

- **Real-time Multiplayer**: WebSocket-based synchronization with Socket.IO
- **Multiple Game Modes**: Free-for-all, Team Deathmatch, Capture the Flag, Gun Game, Battle Royale, Zombie Survival, King of the Hill
- **9 Unique Weapons**: Pistol, Shotgun, SMG, Assault Rifle, Sniper, Rocket Launcher, Grenades, Laser Gun, Plasma Weapon
- **5 Cartoon Maps**: Toy Bedroom, Kitchen Warzone, Backyard Battleground, Mini City, Space Station
- **Player Progression**: XP system, leveling, coins, unlocks
- **Customization**: Skins, emotes, weapon customizations
- **Social Features**: Friends system, party system, global chat
- **Responsive Design**: Works on desktop and mobile browsers
- **Modern UI**: Neon arcade aesthetic with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Phaser.js 3** - Game engine
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animations
- **Zustand** - State management
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Redis** - Matchmaking (optional)

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher (optional, for matchmaking)
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mini-mayhem-arena.git
cd mini-mayhem-arena
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/minimayhem
DB_HOST=localhost
DB_PORT=5432
DB_NAME=minimayhem
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Game Configuration
MAX_PLAYERS_PER_ROOM=8
TICK_RATE=60
ROOM_TIMEOUT=300000
```

### 4. Set Up PostgreSQL

Create a PostgreSQL database:

```bash
# Create database
createdb minimayhem

# Or using psql
psql -U postgres
CREATE DATABASE minimayhem;
```

The database tables will be automatically created when you start the server.

### 5. Start Redis (Optional)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt-get install redis-server && sudo systemctl start redis
```

## 🎯 Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend server on http://localhost:3000

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
npm start
```

#### Start Backend

```bash
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose

The easiest way to deploy the entire stack is using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis (for matchmaking)
- Backend server
- Frontend server

### Manual Docker Build

#### Build Backend

```bash
docker build -t minimayhem-backend .
docker run -p 3001:3001 minimayhem-backend
```

#### Build Frontend

```bash
cd frontend
docker build -t minimayhem-frontend .
docker run -p 3000:3000 minimayhem-frontend
```

## 📁 Project Structure

```
mini-mayhem-arena/
├── server/
│   ├── index.js              # Main server entry point
│   ├── db/
│   │   └── init.js           # Database initialization
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── rooms.js          # Room management routes
│   │   ├── players.js        # Player routes
│   │   └── game.js           # Game routes
│   └── socket/
│       └── handlers.js       # Socket.IO event handlers
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   ├── dashboard/   # Dashboard
│   │   │   ├── rooms/        # Room browser
│   │   │   └── game/         # Game page
│   │   ├── components/
│   │   │   └── game/
│   │   │       ├── GameScene.tsx  # Phaser game scene
│   │   │       └── HUD.tsx        # Game HUD
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── globals.css  # Global styles
│   │   └── lib/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🎮 Game Controls

### Movement
- **WASD** - Move player
- **Mouse** - Aim
- **Left Click** - Shoot
- **R** - Reload
- **1-5** - Switch weapons
- **Shift** - Sprint

### Mobile Controls
- Virtual joystick for movement
- Tap to shoot
- On-screen buttons for weapon switching

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/public` - Get public rooms
- `GET /api/rooms/code/:code` - Get room by code
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `POST /api/rooms/:roomId/ready` - Toggle ready status
- `POST /api/rooms/:roomId/kick/:userId` - Kick player (host only)

### Players
- `GET /api/players/profile` - Get player profile
- `PUT /api/players/profile` - Update player profile
- `GET /api/players/stats` - Get player stats
- `GET /api/players/leaderboard` - Get leaderboard
- `GET /api/players/weapons` - Get player weapons
- `POST /api/players/weapons/equip` - Equip weapon
- `GET /api/players/friends` - Get friends
- `POST /api/players/friends/add` - Add friend

### Game
- `GET /api/game/maps` - Get available maps
- `GET /api/game/modes` - Get game modes
- `GET /api/game/history` - Get match history
- `POST /api/game/match/result` - Save match result
- `GET /api/game/inventory` - Get inventory
- `GET /api/game/battlepass` - Get battle pass

## 🔌 Socket.IO Events

### Client → Server
- `join_room` - Join a game room
- `player_move` - Send player movement
- `player_shoot` - Send shoot action
- `player_hit` - Send hit confirmation
- `player_respawn` - Request respawn
- `switch_weapon` - Switch weapon
- `reload` - Reload weapon
- `start_game` - Start game (host only)
- `chat_message` - Send chat message
- `emote` - Send emote

### Server → Client
- `room_state` - Current room state
- `player_joined` - Player joined room
- `player_left` - Player left room
- `player_moved` - Player movement update
- `bullet_fired` - Bullet fired
- `player_damaged` - Player damaged
- `player_died` - Player died
- `player_respawned` - Player respawned
- `weapon_switched` - Weapon switched
- `player_reloaded` - Player reloaded
- `game_started` - Game started
- `game_ended` - Game ended
- `chat_message` - Chat message
- `player_emote` - Player emote
- `error` - Error message

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Server-side validation
- Rate limiting (implement with express-rate-limit)
- CORS configuration
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping)

## 🚀 Performance Optimization

- 60 FPS target
- Efficient packet handling
- State interpolation
- Client prediction
- Lazy loading
- Asset compression
- CDN-ready assets

## 📊 Monitoring

- Health check endpoint: `/health`
- Server logs
- Database query logging
- Socket.IO connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Phaser.js for the game engine
- Socket.IO for real-time communication
- Next.js team for the amazing framework
- Tailwind CSS for the styling utilities

## 📧 Support

For support, email support@minimayhem.com or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Voice chat integration
- [ ] Replay system
- [ ] Custom map editor
- [ ] Tournament mode
- [ ] Ranked seasons
- [ ] Cross-platform support
- [ ] Mobile app version
- [ ] AI-powered bots
- [ ] Dynamic weather
- [ ] Seasonal events
