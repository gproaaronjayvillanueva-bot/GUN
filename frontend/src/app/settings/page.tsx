'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, ArrowLeft, Settings as SettingsIcon, Volume2, Monitor, Bell, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicVolume: 50,
    sfxVolume: 75,
    graphicsQuality: 'high',
    fullscreen: false,
    notifications: true,
    showOnlineStatus: true,
    allowFriendRequests: true
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('gameSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [router])

  const handleSaveSettings = () => {
    localStorage.setItem('gameSettings', JSON.stringify(settings))
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Settings saved successfully!')
    }, 500)
  }

  const handleResetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      musicVolume: 50,
      sfxVolume: 75,
      graphicsQuality: 'high',
      fullscreen: false,
      notifications: true,
      showOnlineStatus: true,
      allowFriendRequests: true
    }
    setSettings(defaultSettings)
    localStorage.setItem('gameSettings', JSON.stringify(defaultSettings))
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
            <SettingsIcon className="w-10 h-10 text-primary-500" />
            Settings
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
              { id: 'audio', label: 'Audio', icon: <Volume2 className="w-5 h-5" /> },
              { id: 'graphics', label: 'Graphics', icon: <Monitor className="w-5 h-5" /> },
              { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
              { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Notifications</p>
                      <p className="text-gray-400 text-sm">Receive in-game notifications</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.notifications ? 'bg-primary-600' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Show Online Status</p>
                      <p className="text-gray-400 text-sm">Let others see when you're online</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, showOnlineStatus: !settings.showOnlineStatus })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.showOnlineStatus ? 'bg-primary-600' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Allow Friend Requests</p>
                      <p className="text-gray-400 text-sm">Receive friend requests from other players</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, allowFriendRequests: !settings.allowFriendRequests })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.allowFriendRequests ? 'bg-primary-600' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.allowFriendRequests ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Audio Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Sound Enabled</p>
                      <p className="text-gray-400 text-sm">Enable or disable all sounds</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-primary-600' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-white font-semibold">Music Volume</p>
                      <p className="text-gray-400">{settings.musicVolume}%</p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.musicVolume}
                      onChange={(e) => setSettings({ ...settings, musicVolume: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-white font-semibold">SFX Volume</p>
                      <p className="text-gray-400">{settings.sfxVolume}%</p>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sfxVolume}
                      onChange={(e) => setSettings({ ...settings, sfxVolume: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graphics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Graphics Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-white font-semibold mb-2">Graphics Quality</p>
                    <select
                      value={settings.graphicsQuality}
                      onChange={(e) => setSettings({ ...settings, graphicsQuality: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="ultra">Ultra</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Fullscreen</p>
                      <p className="text-gray-400 text-sm">Play in fullscreen mode</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, fullscreen: !settings.fullscreen })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        settings.fullscreen ? 'bg-primary-600' : 'bg-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.fullscreen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                <p className="text-gray-400">Privacy settings are managed in the General tab.</p>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                
                <div className="space-y-4">
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all">
                    Change Password
                  </button>
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all">
                    Update Email
                  </button>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Save/Reset Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-slate-700">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-all"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={handleResetSettings}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
