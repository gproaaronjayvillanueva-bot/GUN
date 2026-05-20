'use client'

import { useState, useEffect } from 'react'
import { Heart, Crosshair, Zap, Trophy, Clock } from 'lucide-react'

export default function HUD() {
  const [health, setHealth] = useState(100)
  const [ammo, setAmmo] = useState(12)
  const [kills, setKills] = useState(0)
  const [deaths, setDeaths] = useState(0)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Match Info */}
        <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-slate-700">
          <div className="flex items-center gap-4 text-white">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">{formatTime(time)}</span>
          </div>
        </div>

        {/* Score */}
        <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-slate-700">
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{kills}</span>
            </div>
            <div className="text-gray-400">/</div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{deaths}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Health & Armor */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
        <div className="space-y-3">
          {/* Health Bar */}
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div className="w-48 h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-white font-bold w-12">{health}</span>
          </div>

          {/* Armor Bar */}
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-500" />
            <div className="w-48 h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: '50%' }}
              />
            </div>
            <span className="text-white font-bold w-12">50</span>
          </div>
        </div>
      </div>

      {/* Bottom Right - Ammo & Weapon */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4">
          <Crosshair className="w-8 h-8 text-primary-500" />
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{ammo}</div>
            <div className="text-sm text-gray-400">Pistol</div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-8 h-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/50 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Weapon Hotkeys */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700">
        <div className="flex gap-2">
          {['1', '2', '3', '4', '5'].map((key, index) => (
            <div
              key={key}
              className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold transition-all ${
                index === 0 ? 'bg-primary-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
