'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Trophy, Medal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface LeaderboardPlayer {
  id: string
  username: string
  avatar_url: string
  xp: number
  level: number
  kills: number
  deaths: number
  wins: number
  losses: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('xp')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchLeaderboard()
  }, [router, sortBy])

  const fetchLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard(50)
      setPlayers(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-500 to-yellow-300'
    if (index === 1) return 'from-gray-400 to-gray-200'
    if (index === 2) return 'from-amber-600 to-amber-400'
    return 'from-slate-700 to-slate-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="w-6 h-6 text-gray-400" />
          <Gamepad2 className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold text-white neon-text">Mini Mayhem Arena</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Leaderboard
          </h1>

          {/* Sort Options */}
          <div className="flex gap-4 mb-8">
            {[
              { value: 'xp', label: 'XP' },
              { value: 'kills', label: 'Kills' },
              { value: 'wins', label: 'Wins' },
              { value: 'kd', label: 'K/D Ratio' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  sortBy === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Player</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Level</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">XP</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Kills</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Deaths</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold">Wins</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(index)}
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center font-bold text-white`}>
                          {player.username[0].toUpperCase()}
                        </div>
                        <span className="text-white font-semibold">{player.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{player.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary-400 font-semibold">{player.xp.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{player.kills.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{player.deaths.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-semibold">{player.wins.toLocaleString()}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
