<script setup lang="ts">
import { View, Star, StarFilled, Share, ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const id = route.params.id

const { data, pending } = await useFetch(`/api/hotspots/${id}`)

// 相关分析
const { data: relatedAnalysis } = await useFetch('/api/analysis', {
  query: { pageSize: 4 }
})

// 互动状态
const isLiked = ref(false)
const isFavorited = ref(false)
const likeCount = ref(0)
const favoriteLoading = ref(false)

function formatDate(dateStr: string) {
  return dateStr?.split('T')[0] || ''
}

function handleLike() {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (favoriteLoading.value) return
  favoriteLoading.value = true

  try {
    if (isFavorited.value) {
      // 取消收藏 - 需要先获取收藏ID
      const favorites = await $fetch('/api/favorites', {
        query: { userId: userStore.user?.id, type: 'hotspot' }
      }) as any
      const favorite = favorites.data?.find((f: any) => f.id === Number(id))
      if (favorite) {
        await $fetch('/api/favorites/remove', {
          method: 'POST',
          body: { favoriteId: favorite.favorite_id }
        })
        ElMessage.success('已取消收藏')
      }
      isFavorited.value = false
    } else {
      // 添加收藏
      const result = await $fetch('/api/favorites/add', {
        method: 'POST',
        body: {
          userId: userStore.user?.id,
          targetType: 'hotspot',
          targetId: Number(id)
        }
      }) as any
      if (result.success) {
        isFavorited.value = true
        ElMessage.success('收藏成功')
      } else {
        // 如果已收藏，更新状态
        if (result.message === '已收藏') {
          isFavorited.value = true
        } else {
          ElMessage.error(result.message || '收藏失败')
        }
      }
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.data?.message || '操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

function goBack() {
  router.back()
}

// 检查是否已收藏
async function checkFavoriteStatus() {
  if (!userStore.isLoggedIn || !userStore.user?.id) return

  try {
    const favorites = await $fetch('/api/favorites', {
      query: { userId: userStore.user?.id, type: 'hotspot' }
    })
    isFavorited.value = favorites.data?.some((f: any) => f.id === Number(id)) || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 初始化
watchEffect(() => {
  if (data.value?.data) {
    likeCount.value = data.value.data.like_count
    checkFavoriteStatus()
  }
})
</script>

<template>
  <div class="hotspot-detail">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回列表</span>
    </button>

    <div v-if="pending" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="data?.success && data.data">
      <div class="detail-wrapper">
        <!-- 主内容 -->
        <article class="main-content">
          <!-- 头部 -->
          <header class="article-header">
            <div class="header-tags">
              <span class="category-tag">{{ data.data.category }}</span>
              <span class="source-tag">{{ data.data.source }}</span>
            </div>
            <h1>{{ data.data.title }}</h1>
            <div class="header-meta">
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ data.data.view_count }} 次浏览
              </span>
              <span class="meta-item">
                发布于 {{ formatDate(data.data.published_at || data.data.created_at) }}
              </span>
            </div>
          </header>

          <!-- 摘要 -->
          <div class="article-summary">
            <div class="summary-icon">摘要</div>
            <p>{{ data.data.summary }}</p>
          </div>

          <!-- 内容 -->
          <div class="article-content">
            <p v-if="data.data.content" v-html="data.data.content"></p>
            <div v-else class="no-content">
              <p>该热点话题正在持续发酵中，详情内容正在整理...</p>
              <a :href="data.data.source_url" target="_blank" class="source-link">
                点击查看原始来源 →
              </a>
            </div>
          </div>

          <!-- 标签 -->
          <div class="article-tags" v-if="data.data.tags">
            <span v-for="tag in data.data.tags.split(',')" :key="tag" class="tag">
              #{{ tag }}
            </span>
          </div>

          <!-- 互动栏 -->
          <div class="article-actions">
            <button :class="['action-btn', 'like-btn', { active: isLiked }]" @click="handleLike">
              <el-icon><Star /></el-icon>
              <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
              <span class="count">{{ likeCount }}</span>
            </button>
            <button :class="['action-btn', 'favorite-btn', { active: isFavorited }]" @click="handleFavorite">
              <el-icon><Star /></el-icon>
              <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="action-btn share-btn">
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </button>
            <button class="action-btn comment-btn">
              <el-icon><ChatDotRound /></el-icon>
              <span>评论</span>
            </button>
          </div>
        </article>

        <!-- 侧边栏 -->
        <aside class="sidebar">
          <!-- 来源信息 -->
          <div class="source-card">
            <h3>信息来源</h3>
            <p class="source-name">{{ data.data.source }}</p>
            <a v-if="data.data.source_url" :href="data.data.source_url" target="_blank" class="source-link">
              查看原文
            </a>
          </div>

          <!-- 相关分析 -->
          <div class="related-card">
            <h3>相关分析</h3>
            <div v-if="relatedAnalysis?.data?.list?.length" class="related-list">
              <NuxtLink
                v-for="item in relatedAnalysis.data.list"
                :key="item.id"
                :to="`/analysis/${item.id}`"
                class="related-item"
              >
                <span class="related-category">{{ item.category }}</span>
                <p class="related-title">{{ item.title }}</p>
              </NuxtLink>
            </div>
            <p v-else class="no-related">暂无相关分析</p>
          </div>
        </aside>
      </div>
    </template>

    <el-empty v-else description="热点不存在" />
  </div>
</template>

<style lang="scss" scoped>
.hotspot-detail {
  max-width: 1100px;
  margin: 0 auto;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: none;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
    background: #f8fafc;
  }
}

.detail-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.main-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  .article-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;

    .header-tags {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;

      .category-tag {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
      }

      .source-tag {
        background: #f1f5f9;
        color: #64748b;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
      }
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px;
      line-height: 1.4;
    }

    .header-meta {
      display: flex;
      gap: 24px;
      color: #94a3b8;
      font-size: 14px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .article-summary {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    border-left: 4px solid #667eea;
    display: flex;
    gap: 16px;

    .summary-icon {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      height: fit-content;
      white-space: nowrap;
    }

    p {
      flex: 1;
      color: #475569;
      line-height: 1.8;
      margin: 0;
    }
  }

  .article-content {
    color: #334155;
    line-height: 1.8;
    font-size: 16px;
    margin-bottom: 32px;

    p {
      margin-bottom: 16px;
    }

    .no-content {
      text-align: center;
      padding: 40px;
      color: #94a3b8;

      p {
        margin-bottom: 16px;
      }

      .source-link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;

    .tag {
      background: #f8fafc;
      color: #667eea;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .article-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .count {
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      &.active {
        &.like-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
          color: white;

          .count {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }
        }

        &.favorite-btn {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #f59e0b;
        }
      }
    }
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .source-card, .related-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
  }

  .source-card {
    .source-name {
      color: #64748b;
      font-size: 14px;
      margin: 0 0 12px;
    }

    .source-link {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .related-card {
    .related-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .related-item {
      display: block;
      padding: 12px;
      border-radius: 10px;
      background: #f8fafc;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        background: #f1f5f9;
        transform: translateX(4px);
      }

      .related-category {
        display: inline-block;
        font-size: 11px;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 6px;
      }

      .related-title {
        color: #334155;
        font-size: 13px;
        margin: 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .no-related {
      color: #94a3b8;
      font-size: 14px;
      text-align: center;
    }
  }
}

@media (max-width: 992px) {
  .detail-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }
}
</style>