'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Plus, LogOut, Trophy, Users, Zap, Settings, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold text-white neon-text">Mini Mayhem Arena</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span>{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400 text-lg">Ready for battle?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <Trophy className="w-6 h-6" />, label: 'Rank', value: user?.profile?.rank || 'Bronze', color: 'primary' },
            { icon: <Zap className="w-6 h-6" />, label: 'Level', value: user?.level || 1, color: 'accent' },
            { icon: <Users className="w-6 h-6" />, label: 'Coins', value: user?.coins || 0, color: 'secondary' },
            { icon: <Trophy className="w-6 h-6" />, label: 'Wins', value: user?.profile?.wins || 0, color: 'primary' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-${stat.color}-500 transition-all`}
            >
              <div className={`text-${stat.color}-500 mb-2`}>{stat.icon}</div>
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/rooms" className="bg-gradient-to-br from-primary-600 to-pink-600 p-8 rounded-xl hover:scale-105 transition-all">
              <Plus className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Create Room</h3>
              <p className="text-white/80">Host your own battle arena</p>
            </Link>

            <Link href="/rooms" className="bg-gradient-to-br from-secondary-600 to-blue-600 p-8 rounded-xl hover:scale-105 transition-all">
              <Users className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Browse Rooms</h3>
              <p className="text-white/80">Join an existing game</p>
            </Link>

            <Link href="/inventory" className="bg-gradient-to-br from-accent-600 to-green-600 p-8 rounded-xl hover:scale-105 transition-all">
              <Zap className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
              <p className="text-white/80">Customize your loadout</p>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Trophy />, label: 'Leaderboard', href: '/leaderboard' },
              { icon: <Users />, label: 'Friends', href: '/friends' },
              { icon: <Settings />, label: 'Settings', href: '/settings' },
              { icon: <Play />, label: 'Quick Play', href: '/rooms' }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-primary-500 transition-all flex items-center gap-4 hover:scale-105"
              >
                <div className="text-primary-500">{item.icon}</div>
                <span className="text-white font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
