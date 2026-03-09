<script setup lang="ts">
import { Calendar, EditPen } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const userId = route.params.id

// 获取用户信息
const { data, pending } = await useFetch(`/api/user/${userId}`)

// 格式化日期
function formatDate(dateStr: string) {
  return dateStr?.split('T')[0] || ''
}

// 获取头像文字
const avatarText = computed(() => {
  const user = data.value?.data
  if (user?.nickname || user?.username) {
    return (user.nickname || user.username).charAt(0).toUpperCase()
  }
  return 'U'
})

// 显示名称
const displayName = computed(() => {
  const user = data.value?.data
  return user?.nickname || user?.username || '未知用户'
})

// 判断是否是当前用户
const isCurrentUser = computed(() => {
  return userStore.user?.id === Number(userId)
})
</script>

<template>
  <div class="user-detail page-container">
    <div v-if="pending" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else-if="data?.success && data?.data">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <el-avatar :size="100" :src="data.data.avatar">
            {{ avatarText }}
          </el-avatar>
        </div>
        <div class="user-info">
          <h1>{{ displayName }}</h1>
          <p class="bio">{{ data.data.bio || '这个人很懒，什么都没写...' }}</p>
          <div class="meta">
            <span>
              <el-icon><Calendar /></el-icon>
              加入于 {{ formatDate(data.data.created_at) }}
            </span>
            <el-tag v-if="data.data.role === 'admin'" type="danger" size="small">管理员</el-tag>
          </div>
        </div>
        <div v-if="isCurrentUser" class="user-actions">
          <el-button type="primary" @click="router.push('/user/profile')">
            <el-icon><EditPen /></el-icon>
            编辑资料
          </el-button>
        </div>
      </div>

      <!-- 用户统计 -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">0</span>
          <span class="stat-label">发布</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">0</span>
          <span class="stat-label">评论</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">0</span>
          <span class="stat-label">收藏</span>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="tip-card">
        <el-empty description="更多功能开发中...">
          <template #image>
            <el-icon :size="60" color="#e2e8f0"><EditPen /></el-icon>
          </template>
        </el-empty>
      </div>
    </template>

    <el-empty v-else description="用户不存在">
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </el-empty>
  </div>
</template>

<style lang="scss" scoped>
.user-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  padding: 40px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  .user-avatar {
    flex-shrink: 0;

    .el-avatar {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      font-size: 36px;
      font-weight: 600;
    }
  }

  .user-info {
    flex: 1;

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      color: #1e293b;
    }

    .bio {
      color: #64748b;
      font-size: 14px;
      margin: 0 0 12px;
      line-height: 1.6;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #94a3b8;
      font-size: 13px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .user-actions {
    flex-shrink: 0;
  }
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .stat-item {
    background: white;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    .stat-value {
      display: block;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: #94a3b8;
    }
  }
}

.tip-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

@media (max-width: 640px) {
  .user-card {
    flex-direction: column;
    text-align: center;

    .user-info {
      .meta {
        justify-content: center;
      }
    }
  }

  .stats-card {
    grid-template-columns: repeat(3, 1fr);

    .stat-item {
      padding: 16px;

      .stat-value {
        font-size: 22px;
      }
    }
  }
}
</style>