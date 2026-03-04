import { defineStore } from 'pinia'
import type { User } from '~/types'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  heartbeatTimer: ReturnType<typeof setInterval> | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    isLoggedIn: false,
    heartbeatTimer: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.nickname || state.user?.username || '未登录'
  },

  actions: {
    setUser(user: User) {
      this.user = user
      this.isLoggedIn = true
    },

    setToken(token: string) {
      this.token = token
      // 保存到localStorage
      if (process.client) {
        localStorage.setItem('token', token)
      }
    },

    logout() {
      this.stopHeartbeat()
      this.user = null
      this.token = null
      this.isLoggedIn = false
      if (process.client) {
        localStorage.removeItem('token')
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await $fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        if (response.success && response.data) {
          this.setUser(response.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.logout()
      }
    },

    async login(username: string, password: string) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        })

        if (response.success && response.data) {
          this.setToken(response.data.token)
          this.setUser(response.data.user)
          return { success: true }
        }

        return { success: false, message: response.message || '登录失败' }
      } catch (error: any) {
        return { success: false, message: error.data?.message || '登录失败' }
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { username, email, password }
        })

        if (response.success) {
          return { success: true, message: '注册成功' }
        }

        return { success: false, message: response.message || '注册失败' }
      } catch (error: any) {
        return { success: false, message: error.data?.message || '注册失败' }
      }
    },

    startHeartbeat() {
      if (this.heartbeatTimer) return

      const sendHeartbeat = async () => {
        if (!this.token || !this.user?.id) return

        try {
          await $fetch('/api/online/heartbeat', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`
            },
            body: { userId: this.user.id }
          })
        } catch (error) {
          console.error('心跳发送失败:', error)
        }
      }

      // 立即发送一次心跳
      sendHeartbeat()

      // 每20秒发送心跳
      this.heartbeatTimer = setInterval(sendHeartbeat, 20000)
    },

    stopHeartbeat() {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
      }
    }
  }
})