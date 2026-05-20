'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, Trophy, Zap, Shield, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-fast" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-fast" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-fast" style={{ animationDelay: '2s' }} />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-white neon-text">Mini Mayhem Arena</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-white hover:text-primary-400 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all hover:scale-105">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 neon-text">
              MINI MAYHEM
              <span className="block text-primary-500">ARENA</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              A modern browser-based multiplayer gun battle game. Join the arena, battle friends, and become the ultimate champion!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Play Now
              </Link>
              <Link href="/rooms" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 border border-slate-600">
                <Users className="w-5 h-5" />
                Browse Rooms
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 container mx-auto px-8 py-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12 neon-text">Game Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-12 h-12" />,
                title: 'Multiplayer Battles',
                description: 'Real-time PvP combat with up to 8 players per room. Create rooms, invite friends, and battle it out!'
              },
              {
                icon: <Trophy className="w-12 h-12" />,
                title: 'Ranking System',
                description: 'Climb the leaderboards, earn XP, unlock cosmetics, and prove you\'re the best player.'
              },
              {
                icon: <Zap className="w-12 h-12" />,
                title: 'Fast-Paced Action',
                description: 'Arcade-style gameplay with smooth controls, multiple weapons, and intense combat scenarios.'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'Customization',
                description: 'Personalize your character with skins, emotes, and weapon customizations.'
              },
              {
                icon: <Gamepad2 className="w-12 h-12" />,
                title: 'Multiple Game Modes',
                description: 'Free-for-all, Team Deathmatch, Capture the Flag, and more exciting game modes.'
              },
              {
                icon: <Play className="w-12 h-12" />,
                title: 'Browser-Based',
                description: 'No download required! Play directly in your browser on desktop or mobile devices.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-primary-500 transition-all hover:scale-105"
              >
                <div className="text-primary-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative z-10 container mx-auto px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary-600 to-pink-600 p-12 rounded-2xl"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Battle?</h2>
            <p className="text-xl text-white/90 mb-8">Join thousands of players in the ultimate mini arena combat!</p>
            <Link href="/register" className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg transition-all hover:scale-105">
              Get Started Free
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-slate-800 mt-20">
          <div className="container mx-auto px-8 py-8 text-center text-gray-400">
            <p>&copy; 2024 Mini Mayhem Arena. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
