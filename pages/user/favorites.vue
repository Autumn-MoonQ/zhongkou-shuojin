<script setup lang="ts">
import { View, Star, Delete, ArrowRight, Document, TrendCharts, DataAnalysis } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 如果未登录，跳转到登录页
if (!userStore.isLoggedIn) {
  router.push('/login')
}

const activeTab = ref((route.query.type as string) || 'all')

// 获取收藏列表
const { data, pending, refresh } = await useFetch('/api/favorites', {
  query: computed(() => ({
    userId: userStore.user?.id,
    type: activeTab.value
  }))
})

// 类型标签配置
const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
  hotspot: { label: '热点', icon: TrendCharts, color: '#667eea' },
  analysis: { label: '分析', icon: DataAnalysis, color: '#f59e0b' },
  essay: { label: '论述题', icon: Document, color: '#10b981' }
}

// 类型到路由的映射
const typeRoutes: Record<string, string> = {
  hotspot: 'hotspots',
  analysis: 'analysis',
  essay: 'essays'
}

// 取消收藏
const handleRemove = async (favoriteId: number) => {
  try {
    await $fetch('/api/favorites/remove', {
      method: 'POST',
      body: { favoriteId }
    })
    refresh()
  } catch (error) {
    console.error('取消收藏失败:', error)
  }
}

// 切换标签
function handleTabChange(tab: string) {
  activeTab.value = tab
  router.push({ query: { type: tab || undefined } })
}
</script>

<template>
  <div class="favorites-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <div class="title-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="title-text">
            <h1>我的收藏</h1>
            <p>管理您收藏的热点、分析和论述题</p>
          </div>
        </div>
        <div class="stats-info">
          <span class="total-count">{{ data?.data?.length || 0 }}</span>
          <span class="total-label">个收藏</span>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="filter-tabs">
      <button
        :class="['tab-item', { active: activeTab === 'all' }]"
        @click="handleTabChange('all')"
      >
        全部
      </button>
      <button
        :class="['tab-item', { active: activeTab === 'hotspot' }]"
        @click="handleTabChange('hotspot')"
      >
        <el-icon><TrendCharts /></el-icon>
        热点
      </button>
      <button
        :class="['tab-item', { active: activeTab === 'analysis' }]"
        @click="handleTabChange('analysis')"
      >
        <el-icon><DataAnalysis /></el-icon>
        分析
      </button>
      <button
        :class="['tab-item', { active: activeTab === 'essay' }]"
        @click="handleTabChange('essay')"
      >
        <el-icon><Document /></el-icon>
        论述题
      </button>
    </div>

    <!-- 收藏列表 -->
    <div v-if="pending" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="data?.data?.length" class="favorites-grid">
      <div
        v-for="item in data.data"
        :key="item.favorite_id"
        class="favorite-card"
      >
        <NuxtLink :to="`/${typeRoutes[item.type]}/${item.id}`" class="card-link">
          <!-- 类型标签 -->
          <div class="card-type" :style="{ background: typeLabels[item.type]?.color || '#667eea' }">
            <el-icon><component :is="typeLabels[item.type]?.icon" /></el-icon>
            {{ typeLabels[item.type]?.label }}
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-summary">{{ item.summary?.substring(0, 80) }}...</p>

            <div class="card-footer">
              <div class="card-meta">
                <span class="category">{{ item.category }}</span>
                <span class="views">
                  <el-icon><View /></el-icon>
                  {{ item.view_count }}
                </span>
              </div>
              <span class="read-more">
                查看详情
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </NuxtLink>

        <!-- 删除按钮 -->
        <button class="remove-btn" @click.stop="handleRemove(item.favorite_id)">
          <el-icon><Delete /></el-icon>
        </button>
      </div>
    </div>

    <el-empty v-else description="暂无收藏内容">
      <template #image>
        <el-icon :size="80" color="#e2e8f0"><Star /></el-icon>
      </template>
      <NuxtLink to="/hotspots">
        <el-button type="primary">去发现热点</el-button>
      </NuxtLink>
    </el-empty>
  </div>
</template>

<style lang="scss" scoped>
.favorites-page {
  max-width: 1100px;
  margin: 0 auto;
}

// 页面头部
.page-header {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .title-text {
      h1 {
        font-size: 26px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 4px;
      }

      p {
        font-size: 14px;
        color: #94a3b8;
        margin: 0;
      }
    }
  }

  .stats-info {
    text-align: right;

    .total-count {
      display: block;
      font-size: 32px;
      font-weight: 700;
      color: #f59e0b;
    }

    .total-label {
      font-size: 14px;
      color: #94a3b8;
    }
  }
}

// 筛选标签
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    &.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-color: transparent;
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
  }
}

// 收藏网格
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.favorite-card {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);

    .remove-btn {
      opacity: 1;
    }
  }

  .card-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .card-type {
    position: absolute;
    top: 0;
    right: 0;
    padding: 6px 14px;
    border-radius: 0 16px 0 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-content {
    padding: 24px;
    padding-top: 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 10px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      padding-right: 80px;
    }

    .card-summary {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .category {
          font-size: 12px;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .views {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
        }
      }

      .read-more {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #f59e0b;
        font-weight: 500;
      }
    }
  }

  .remove-btn {
    position: absolute;
    top: 50px;
    right: 12px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #fee2e2;
    color: #dc2626;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #dc2626;
      color: white;
    }
  }
}

@media (max-width: 768px) {
  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>