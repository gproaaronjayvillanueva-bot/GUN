'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, ArrowLeft, Package, Zap, Shield, Sword } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<any[]>([])
  const [weapons, setWeapons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weapons')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')!
      const [invData, weaponsData] = await Promise.all([
        api.getInventory(token),
        api.getWeapons(token)
      ])
      setInventory(invData.inventory || [])
      setWeapons(weaponsData.weapons || [])
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEquipWeapon = async (weaponId: string) => {
    try {
      const token = localStorage.getItem('token')!
      await api.equipWeapon(token, weaponId)
      fetchData()
    } catch (error) {
      console.error('Failed to equip weapon:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading inventory...</div>
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
            <Package className="w-10 h-10 text-primary-500" />
            Inventory
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              { id: 'weapons', label: 'Weapons', icon: <Sword className="w-5 h-5" /> },
              { id: 'skins', label: 'Skins', icon: <Shield className="w-5 h-5" /> },
              { id: 'powerups', label: 'Power-ups', icon: <Zap className="w-5 h-5" /> },
              { id: 'emotes', label: 'Emotes', icon: <Package className="w-5 h-5" /> }
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

          {/* Weapons Grid */}
          {activeTab === 'weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weapons.map((weapon, index) => (
                <motion.div
                  key={weapon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border transition-all ${
                    weapon.is_equipped
                      ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{weapon.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{weapon.type}</p>
                    </div>
                    {weapon.is_equipped && (
                      <div className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                        EQUIPPED
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Damage</span>
                      <span className="text-white font-semibold">{weapon.damage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fire Rate</span>
                      <span className="text-white font-semibold">{weapon.fire_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Magazine</span>
                      <span className="text-white font-semibold">{weapon.magazine_size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Range</span>
                      <span className="text-white font-semibold">{weapon.range}m</span>
                    </div>
                  </div>

                  {!weapon.is_equipped && weapon.is_unlocked && (
                    <button
                      onClick={() => handleEquipWeapon(weapon.id)}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
                    >
                      Equip
                    </button>
                  )}

                  {!weapon.is_unlocked && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Unlock at Level {weapon.unlock_level}</p>
                      <p className="text-primary-400 font-semibold">{weapon.cost} coins</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'weapons' && (
            <div className="bg-slate-800/50 backdrop-blur-sm p-12 rounded-xl border border-slate-700 text-center">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Coming soon!</p>
              <p className="text-gray-500 text-sm mt-2">More items will be added in future updates</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
