<script setup lang="ts">
const userStore = useUserStore()
const route = useRoute()

// 导航菜单
const menuItems = [
  { path: '/', label: '首页', icon: 'HomeFilled' },
  { path: '/hotspots', label: '热点整合', icon: 'TrendCharts' },
  { path: '/analysis', label: '舆论分析', icon: 'DataAnalysis' },
  { path: '/essays', label: '论述题解析', icon: 'Document' }
]

// 检查当前路由
const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout-container">
    <!-- 顶部导航 -->
    <header class="layout-header">
      <div class="header-content">
        <!-- Logo -->
        <NuxtLink to="/" class="logo">
          <div class="logo-icon">
            <span>众</span>
          </div>
          <div class="logo-text">
            <span class="name">众口铄金</span>
            <span class="slogan">热点·舆论·解析</span>
          </div>
        </NuxtLink>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: isActive(item.path) }]"
          >
            <span class="nav-text">{{ item.label }}</span>
            <span class="nav-indicator"></span>
          </NuxtLink>
        </nav>

        <!-- 用户区域 -->
        <div class="user-area">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown>
              <div class="user-info">
                <el-avatar :size="36" :src="userStore.user?.avatar" class="user-avatar">
                  {{ userStore.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.username }}</span>
                <el-icon class="arrow"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <NuxtLink to="/user/profile">个人中心</NuxtLink>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <NuxtLink to="/user/favorites">我的收藏</NuxtLink>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="userStore.logout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="login-btn">登录</NuxtLink>
            <NuxtLink to="/register" class="register-btn">
              <span>注册</span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="layout-main">
      <slot />
    </main>

    <!-- 底部 -->
    <footer class="layout-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-brand">
            <span class="brand-name">众口铄金</span>
            <span class="brand-desc">热点整合·舆论分析·文科论述题深度解析</span>
          </div>
          <div class="footer-links">
            <a href="#">关于我们</a>
            <a href="#">联系方式</a>
            <a href="#">隐私政策</a>
            <a href="#">用户协议</a>
          </div>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2026 众口铄金 - 立足新媒体时代信息传播特点，打造专业内容体系</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

.layout-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;

  .header-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;

  .logo-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    span {
      color: white;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 1px;
    }

    .slogan {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 2px;
    }
  }
}

.nav-menu {
  display: flex;
  gap: 4px;

  .nav-item {
    position: relative;
    padding: 10px 20px;
    border-radius: 10px;
    color: #64748b;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.08);
    }

    &.active {
      color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);

      .nav-indicator {
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 3px;
      }
    }
  }
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px 6px 6px;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .username {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
    }

    .arrow {
      color: #94a3b8;
      font-size: 12px;
    }
  }

  .login-btn {
    color: #667eea;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    padding: 8px 16px;
    transition: all 0.3s ease;

    &:hover {
      color: #764ba2;
    }
  }

  .register-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    padding: 10px 24px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }
}

.layout-main {
  flex: 1;
  padding: 32px;
}

.layout-footer {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: auto;

  .footer-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 32px 24px;
  }

  .footer-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }

    .brand-desc {
      font-size: 13px;
      color: #94a3b8;
    }
  }

  .footer-links {
    display: flex;
    gap: 24px;

    a {
      color: #64748b;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #667eea;
      }
    }
  }

  .footer-copyright {
    padding-top: 20px;
    text-align: center;

    p {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .layout-header .header-content {
    padding: 0 16px;
    height: 64px;
  }

  .logo .logo-text .name {
    font-size: 16px;
  }

  .nav-menu {
    display: none;
  }

  .layout-main {
    padding: 16px;
  }
}
</style>