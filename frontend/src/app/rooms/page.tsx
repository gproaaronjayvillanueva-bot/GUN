'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Plus, Search, Lock, Users, Play, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'

interface Room {
  id: string
  room_code: string
  name: string
  host_username: string
  player_count: number
  max_players: number
  game_mode: string
  map_id: string
}

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    isPrivate: false,
    maxPlayers: 8,
    gameMode: 'free_for_all',
    mapId: 'toy_bedroom',
    password: ''
  })
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchRooms()

    // Connect to socket
    const socketInstance = io('http://localhost:3001', {
      auth: { token }
    })
    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [router])

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms/public')
      const data = await response.json()
      setRooms(data.rooms || [])
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createFormData)
      })

      const data = await response.json()
      if (response.ok) {
        router.push(`/game/${data.room.id}`)
      }
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        router.push(`/game/${roomId}`)
      }
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.room_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="w-6 h-6 text-gray-400" />
          <Gamepad2 className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold text-white neon-text">Mini Mayhem Arena</span>
        </Link>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </button>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Browse Rooms</h1>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms by name or code..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No rooms found. Create one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-primary-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                      <p className="text-gray-400 text-sm">Code: {room.room_code}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary-400">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">{room.player_count}/{room.max_players}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-primary-500">Mode:</span>
                      <span className="capitalize">{room.game_mode.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-primary-500">Map:</span>
                      <span className="capitalize">{room.map_id.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-primary-500">Host:</span>
                      <span>{room.host_username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.player_count >= room.max_players}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {room.player_count >= room.max_players ? 'Full' : 'Join Room'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create Room</h2>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Room Name</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Enter room name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Max Players</label>
                  <select
                    value={createFormData.maxPlayers}
                    onChange={(e) => setCreateFormData({ ...createFormData, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={10}>10 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Game Mode</label>
                  <select
                    value={createFormData.gameMode}
                    onChange={(e) => setCreateFormData({ ...createFormData, gameMode: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="free_for_all">Free For All</option>
                    <option value="team_deathmatch">Team Deathmatch</option>
                    <option value="capture_the_flag">Capture The Flag</option>
                    <option value="gun_game">Gun Game</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Map</label>
                <select
                  value={createFormData.mapId}
                  onChange={(e) => setCreateFormData({ ...createFormData, mapId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="toy_bedroom">Toy Bedroom</option>
                  <option value="kitchen_warzone">Kitchen Warzone</option>
                  <option value="backyard_battleground">Backyard Battleground</option>
                  <option value="mini_city">Mini City</option>
                  <option value="space_station">Space Station</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={createFormData.isPrivate}
                  onChange={(e) => setCreateFormData({ ...createFormData, isPrivate: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="private" className="text-gray-300">Private Room</label>
              </div>

              {createFormData.isPrivate && (
                <div>
                  <label className="block text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
