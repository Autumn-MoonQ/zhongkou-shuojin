<script setup lang="ts">
interface OnlineUser {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
}

const onlineUsers = ref<OnlineUser[]>([])
const loading = ref(false)
const isExpanded = ref(false)

// 获取在线用户列表
const fetchOnlineUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/online/users')
    if (response.success && response.data) {
      onlineUsers.value = response.data
    }
  } catch (error) {
    console.error('获取在线用户失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化显示名称
const displayName = (user: OnlineUser) => {
  return user.nickname || user.username
}

// 获取头像文字
const avatarText = (user: OnlineUser) => {
  const name = displayName(user)
  return name.charAt(0).toUpperCase()
}

// 跳转到用户主页
const goToProfile = (userId: number) => {
  navigateTo(`/user/${userId}`)
}

onMounted(() => {
  fetchOnlineUsers()
  // 每30秒刷新一次在线用户
  const timer = setInterval(fetchOnlineUsers, 30000)
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<template>
  <div
    class="online-float"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- 浮标按钮 -->
    <div class="float-btn">
      <el-icon :size="20"><UserFilled /></el-icon>
      <span class="count" v-if="onlineUsers.length > 0">{{ onlineUsers.length }}</span>
    </div>

    <!-- 展开面板 -->
    <Transition name="expand">
      <div v-show="isExpanded" class="float-panel">
        <div class="panel-header">
          <span class="panel-title">在线用户</span>
          <el-tag type="success" size="small" effect="light">
            {{ onlineUsers.length }} 人
          </el-tag>
        </div>

        <div class="panel-content" v-loading="loading">
          <div v-if="onlineUsers.length === 0" class="empty-tip">
            暂无在线用户
          </div>
          <div v-else class="user-list">
            <div
              class="user-item"
              v-for="user in onlineUsers"
              :key="user.id"
              @click="goToProfile(user.id)"
            >
              <el-avatar
                :size="32"
                :src="user.avatar"
                class="user-avatar"
              >
                {{ avatarText(user) }}
              </el-avatar>
              <span class="user-name">{{ displayName(user) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.online-float {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.float-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  .count {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: #22c55e;
    color: white;
    font-size: 11px;
    font-weight: 600;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.float-panel {
  position: absolute;
  right: 60px;
  bottom: 0;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.panel-content {
  max-height: 280px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 2px;
  }
}

.empty-tip {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  padding: 20px 0;
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 过渡动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>