import Phaser from 'phaser'
import { Socket } from 'socket.io-client'

export class GameScene extends Phaser.Scene {
  private socket!: Socket
  private roomId!: string
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map()
  localPlayer!: Phaser.GameObjects.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: any
  private bullets: Map<string, Phaser.GameObjects.Sprite> = new Map()
  private lastShotTime: number = 0
  private shootCooldown: number = 200

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Get data from scene
    this.socket = this.data.get('socket')
    this.roomId = this.data.get('roomId')

    // Create map background
    this.createMap()

    // Create input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    // Create local player
    this.createLocalPlayer()

    // Setup socket listeners
    this.setupSocketListeners()

    // Setup mouse click for shooting
    this.input.on('pointerdown', this.handleShoot, this)
  }

  update() {
    if (!this.localPlayer) return

    // Handle movement
    const speed = 5
    let moved = false

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.localPlayer.x -= speed
      moved = true
    }
    if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.localPlayer.x += speed
      moved = true
    }
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.localPlayer.y -= speed
      moved = true
    }
    if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.localPlayer.y += speed
      moved = true
    }

    // Rotate player towards mouse
    const pointer = this.input.activePointer
    const angle = Phaser.Math.Angle.Between(
      this.localPlayer.x,
      this.localPlayer.y,
      pointer.worldX,
      pointer.worldY
    )
    this.localPlayer.rotation = angle

    // Send movement to server
    if (moved) {
      this.socket.emit('player_move', {
        x: this.localPlayer.x,
        y: this.localPlayer.y,
        rotation: this.localPlayer.rotation
      })
    }

    // Update bullets
    this.updateBullets()
  }

  private createMap() {
    // Create a simple toy bedroom map
    const graphics = this.add.graphics()

    // Floor
    graphics.fillStyle(0x8B4513, 1)
    graphics.fillRect(0, 0, 2000, 2000)

    // Add some obstacles (toy blocks)
    const obstacles = [
      { x: 200, y: 200, width: 100, height: 100, color: 0xFF6B6B },
      { x: 500, y: 300, width: 80, height: 120, color: 0x4ECDC4 },
      { x: 800, y: 150, width: 150, height: 80, color: 0xFFE66D },
      { x: 300, y: 600, width: 120, height: 120, color: 0x95E1D3 },
      { x: 700, y: 500, width: 100, height: 100, color: 0xF38181 },
      { x: 1000, y: 400, width: 80, height: 150, color: 0xAA96DA },
    ]

    obstacles.forEach(obs => {
      graphics.fillStyle(obs.color, 1)
      graphics.fillRect(obs.x, obs.y, obs.width, obs.height)
      
      // Add physics body
      this.add.rectangle(obs.x + obs.width/2, obs.y + obs.height/2, obs.width, obs.height, obs.color)
        .setStrokeStyle(2, 0x000000)
    })

    // Add spawn zones
    graphics.fillStyle(0x00FF00, 0.3)
    graphics.fillCircle(100, 100, 50)
    graphics.fillCircle(1900, 100, 50)
    graphics.fillCircle(100, 1900, 50)
    graphics.fillCircle(1900, 1900, 50)
  }

  private createLocalPlayer() {
    this.localPlayer = this.add.sprite(100, 100, 'player')
    this.localPlayer.setTint(0x00FF00)
    this.localPlayer.setScale(0.5)
  }

  private setupSocketListeners() {
    this.socket.on('player_joined', (data: any) => {
      this.createRemotePlayer(data.playerId, data.username, data.team)
    })

    this.socket.on('player_moved', (data: any) => {
      const player = this.players.get(data.playerId)
      if (player) {
        player.x = data.x
        player.y = data.y
        player.rotation = data.rotation
      }
    })

    this.socket.on('bullet_fired', (data: any) => {
      this.createBullet(data)
    })

    this.socket.on('player_died', (data: any) => {
      const player = this.players.get(data.playerId)
      if (player) {
        player.setVisible(false)
      }
    })

    this.socket.on('player_respawned', (data: any) => {
      const player = this.players.get(data.playerId)
      if (player) {
        player.x = data.x
        player.y = data.y
        player.setVisible(true)
      }
    })
  }

  private createRemotePlayer(playerId: string, username: string, team: string) {
    const color = team === 'red' ? 0xFF0000 : 0x0000FF
    const player = this.add.sprite(100, 100, 'player')
    player.setTint(color)
    player.setScale(0.5)
    this.players.set(playerId, player)

    // Add username text
    const text = this.add.text(player.x, player.y - 30, username, {
      fontSize: '16px',
      color: '#FFFFFF'
    })
    text.setOrigin(0.5)
  }

  private handleShoot(pointer: Phaser.Input.Pointer) {
    const now = Date.now()
    if (now - this.lastShotTime < this.shootCooldown) return

    this.lastShotTime = now

    this.socket.emit('player_shoot', {
      startX: this.localPlayer.x,
      startY: this.localPlayer.y,
      targetX: pointer.worldX,
      targetY: pointer.worldY,
      weapon: 'pistol'
    })
  }

  private createBullet(data: any) {
    const bullet = this.add.circle(data.startX, data.startY, 5, 0xFFFF00)
    this.bullets.set(data.bulletId, bullet)

    // Animate bullet
    const targetX = data.startX + Math.cos(data.angle) * 1000
    const targetY = data.startY + Math.sin(data.angle) * 1000

    this.tweens.add({
      targets: bullet,
      x: targetX,
      y: targetY,
      duration: 1000,
      onComplete: () => {
        bullet.destroy()
        this.bullets.delete(data.bulletId)
      }
    })
  }

  private updateBullets() {
    // Bullet updates handled by tweens
  }
}
