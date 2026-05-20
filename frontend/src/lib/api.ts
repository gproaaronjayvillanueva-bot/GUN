const API_BASE = 'http://localhost:3001/api'

export const api = {
  // Auth
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return response.json()
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    return response.json()
  },

  async getMe(token: string) {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  // Rooms
  async getPublicRooms() {
    const response = await fetch(`${API_BASE}/rooms/public`)
    return response.json()
  },

  async getRoomByCode(code: string) {
    const response = await fetch(`${API_BASE}/rooms/code/${code}`)
    return response.json()
  },

  async createRoom(token: string, data: any) {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async joinRoom(token: string, roomId: string, password?: string) {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    })
    return response.json()
  },

  async leaveRoom(token: string, roomId: string) {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  // Players
  async getProfile(token: string) {
    const response = await fetch(`${API_BASE}/players/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async updateProfile(token: string, data: any) {
    const response = await fetch(`${API_BASE}/players/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async getStats(token: string) {
    const response = await fetch(`${API_BASE}/players/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async getLeaderboard(limit?: number) {
    const response = await fetch(`${API_BASE}/players/leaderboard?limit=${limit || 10}`)
    return response.json()
  },

  async getWeapons(token: string) {
    const response = await fetch(`${API_BASE}/players/weapons`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async equipWeapon(token: string, weaponId: string) {
    const response = await fetch(`${API_BASE}/players/weapons/equip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ weaponId })
    })
    return response.json()
  },

  async getFriends(token: string) {
    const response = await fetch(`${API_BASE}/players/friends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async addFriend(token: string, friendId: string) {
    const response = await fetch(`${API_BASE}/players/friends/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId })
    })
    return response.json()
  },

  // Game
  async getMaps() {
    const response = await fetch(`${API_BASE}/game/maps`)
    return response.json()
  },

  async getModes() {
    const response = await fetch(`${API_BASE}/game/modes`)
    return response.json()
  },

  async getMatchHistory(token: string, limit?: number) {
    const response = await fetch(`${API_BASE}/game/history?limit=${limit || 20}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async saveMatchResult(token: string, data: any) {
    const response = await fetch(`${API_BASE}/game/match/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async getInventory(token: string) {
    const response = await fetch(`${API_BASE}/game/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  async getBattlePass(token: string) {
    const response = await fetch(`${API_BASE}/game/battlepass`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }
}
