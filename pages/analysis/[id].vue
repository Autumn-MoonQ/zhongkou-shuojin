<script setup lang="ts">
import { View, Star, StarFilled, ChatDotRound } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const id = route.params.id

const { data, pending } = await useFetch(`/api/analysis/${id}`)

// 互动状态
const isLiked = ref(false)
const isFavorited = ref(false)
const likeCount = ref(0)
const likeId = ref<number | null>(null)
const likeLoading = ref(false)
const favoriteLoading = ref(false)

function formatDate(dateStr: string) {
  return dateStr?.split('T')[0] || ''
}

// 检查是否已收藏
async function checkFavoriteStatus() {
  if (!userStore.isLoggedIn || !userStore.user?.id) return

  try {
    const favorites = await $fetch('/api/favorites', {
      query: { userId: userStore.user?.id, type: 'analysis' }
    }) as any
    isFavorited.value = favorites.data?.some((f: any) => f.id === Number(id)) || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 检查是否已点赞
async function checkLikeStatus() {
  if (!userStore.isLoggedIn || !userStore.user?.id) return

  try {
    const result = await $fetch('/api/likes/check', {
      query: {
        userId: userStore.user?.id,
        targetType: 'analysis',
        targetId: id
      }
    }) as any
    if (result.success && result.data) {
      isLiked.value = result.data.isLiked
      likeId.value = result.data.likeId
    }
  } catch (error) {
    console.error('检查点赞状态失败:', error)
  }
}

// 点赞处理
async function handleLike() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (likeLoading.value) return
  likeLoading.value = true

  try {
    if (isLiked.value) {
      await $fetch('/api/likes/remove', {
        method: 'POST',
        body: { likeId: likeId.value }
      })
      isLiked.value = false
      likeId.value = null
      likeCount.value -= 1
      ElMessage.success('已取消点赞')
    } else {
      const result = await $fetch('/api/likes/add', {
        method: 'POST',
        body: {
          userId: userStore.user?.id,
          targetType: 'analysis',
          targetId: Number(id)
        }
      }) as any
      if (result.success) {
        isLiked.value = true
        likeId.value = result.data?.likeId
        likeCount.value += 1
        ElMessage.success('点赞成功')
      } else if (result.message === '已点赞') {
        isLiked.value = true
        likeId.value = result.data?.likeId
      } else {
        ElMessage.error(result.message || '点赞失败')
      }
    }
  } catch (error: any) {
    console.error('点赞操作失败:', error)
    ElMessage.error(error.data?.message || '操作失败')
  } finally {
    likeLoading.value = false
  }
}

// 收藏处理
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
      const favorites = await $fetch('/api/favorites', {
        query: { userId: userStore.user?.id, type: 'analysis' }
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
      const result = await $fetch('/api/favorites/add', {
        method: 'POST',
        body: {
          userId: userStore.user?.id,
          targetType: 'analysis',
          targetId: Number(id)
        }
      }) as any
      if (result.success) {
        isFavorited.value = true
        ElMessage.success('收藏成功')
      } else if (result.message === '已收藏') {
        isFavorited.value = true
      } else {
        ElMessage.error(result.message || '收藏失败')
      }
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.data?.message || '操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

// 初始化
watchEffect(() => {
  if (data.value?.data) {
    likeCount.value = data.value.data.like_count || 0
    checkFavoriteStatus()
    checkLikeStatus()
  }
})
</script>

<template>
  <div class="analysis-detail page-container">
    <div v-if="pending" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="data?.success && data.data">
      <article class="main-content">
        <header class="article-header">
          <div class="header-tags">
            <el-tag>{{ data.data.category }}</el-tag>
          </div>
          <h1>{{ data.data.title }}</h1>
          <div class="meta">
            <span>发布时间：{{ formatDate(data.data.published_at || data.data.created_at) }}</span>
            <span>
              <el-icon><View /></el-icon>
              {{ data.data.view_count }} 次浏览
            </span>
          </div>
        </header>

        <div class="article-summary">
          <h4>核心观点</h4>
          <p>{{ data.data.summary }}</p>
        </div>

        <div class="article-content" v-html="data.data.content || '<p>暂无详细内容</p>'" />

        <footer class="article-footer">
          <div class="tags" v-if="data.data.tags">
            <el-tag v-for="tag in data.data.tags.split(',')" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
          <div class="actions">
            <button
              :class="['action-btn', 'like-btn', { active: isLiked }]"
              @click="handleLike"
              :disabled="likeLoading"
            >
              <el-icon><Star /></el-icon>
              <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
              <span class="count">{{ likeCount }}</span>
            </button>
            <button
              :class="['action-btn', 'favorite-btn', { active: isFavorited }]"
              @click="handleFavorite"
              :disabled="favoriteLoading"
            >
              <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
              <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="action-btn">
              <el-icon><ChatDotRound /></el-icon>
              <span>评论</span>
            </button>
          </div>
        </footer>
      </article>
    </template>

    <el-empty v-else description="分析文章不存在" />
  </div>
</template>

<style lang="scss" scoped>
.analysis-detail {
  .main-content {
    background: #fff;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .article-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #ebeef5;

      .header-tags {
        margin-bottom: 16px;
      }

      h1 {
        font-size: 28px;
        color: #303133;
        margin-bottom: 16px;
        line-height: 1.4;
      }

      .meta {
        display: flex;
        gap: 24px;
        color: #909399;
        font-size: 14px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .article-summary {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid #667eea;

      h4 {
        color: #303133;
        margin-bottom: 12px;
        font-size: 16px;
      }

      p {
        color: #606266;
        line-height: 1.8;
        margin: 0;
      }
    }

    .article-content {
      line-height: 1.8;
      color: #303133;

      p {
        margin-bottom: 16px;
      }

      h2, h3, h4 {
        margin-top: 24px;
        margin-bottom: 16px;
        color: #303133;
      }
    }

    .article-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #ebeef5;

      .tags {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        gap: 12px;

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

          &:hover:not(:disabled) {
            border-color: #667eea;
            color: #667eea;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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
  }
}
</style>