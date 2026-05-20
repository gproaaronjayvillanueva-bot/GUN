'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import Phaser from 'phaser'
import { GameScene } from '@/components/game/GameScene'
import { HUD } from '@/components/game/HUD'

export default function GamePage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const gameRef = useRef<Phaser.Game | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState<any[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const roomId = params.roomId

    // Initialize Socket.IO connection
    const socket = io('http://localhost:3001', {
      auth: { token }
    })
    socketRef.current = socket

    // Join room
    socket.emit('join_room', { roomId })

    // Socket event listeners
    socket.on('room_state', (data) => {
      setPlayers(data.players)
      setGameStarted(data.gameState === 'playing')
    })

    socket.on('player_joined', (data) => {
      setPlayers((prev) => [...prev, data])
    })

    socket.on('player_left', (data) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId))
    })

    socket.on('game_started', (data) => {
      setGameStarted(true)
      initializeGame(data)
    })

    socket.on('game_ended', (data) => {
      setGameStarted(false)
      // Show results
    })

    socket.on('error', (data) => {
      console.error('Socket error:', data.message)
    })

    return () => {
      socket.disconnect()
      if (gameRef.current) {
        gameRef.current.destroy(true)
      }
    }
  }, [params.roomId, router])

  const initializeGame = (gameData: any) => {
    if (gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      backgroundColor: '#1a1a2e',
      scene: [GameScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    // Pass socket to game scene
    game.scene.scenes[0].setData('socket', socketRef.current)
    game.scene.scenes[0].setData('roomId', params.roomId)
  }

  const handleStartGame = () => {
    socketRef.current?.emit('start_game')
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Lobby</h1>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Players ({players.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold text-white">
                      {player.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{player.username}</div>
                      <div className="text-gray-400 text-sm">{player.team} team</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-xl transition-all hover:scale-105"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div id="game-container" className="w-full h-screen" />
      <HUD />
    </div>
  )
}
