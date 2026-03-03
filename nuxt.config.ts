// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt'
  ],

  elementPlus: {
    importStyle: 'scss'
  },

  css: [
    '@/assets/styles/main.scss'
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'zhongkou-shuojin-secret-key-2024',
    public: {
      siteName: '众口铄金',
      siteDescription: '热点整合·舆论分析·文科论述题深度解析'
    }
  },

  nitro: {
    database: {
      connections: {
        default: {
          connector: 'sqlite',
          options: { name: 'data/zhongkou.db' }
        }
      }
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    }
  }
})