<script setup lang="ts">
interface OnlineUser {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
}

const onlineUsers = ref<OnlineUser[]>([])
const loading = ref(false)

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
  <div class="online-users">
    <div class="online-header">
      <div class="online-title">
        <el-icon class="online-icon"><UserFilled /></el-icon>
        <span>在线用户</span>
      </div>
      <el-tag type="success" size="small" effect="light">
        {{ onlineUsers.length }} 人在线
      </el-tag>
    </div>

    <div class="online-list" v-loading="loading">
      <div v-if="onlineUsers.length === 0" class="empty-tip">
        暂无在线用户
      </div>
      <div
        v-else
        class="user-item"
        v-for="user in onlineUsers"
        :key="user.id"
        @click="goToProfile(user.id)"
      >
        <el-tooltip :content="displayName(user)" placement="top">
          <el-avatar
            :size="36"
            :src="user.avatar"
            class="user-avatar"
          >
            {{ avatarText(user) }}
          </el-avatar>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.online-users {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.online-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.online-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.online-icon {
  color: #667eea;
}

.online-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

.empty-tip {
  width: 100%;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  padding: 12px 0;
}

.user-item {
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
}
</style>