<script setup lang="ts">
import { DataAnalysis, View, Star, ChatDotRound, Timer, ArrowRight, Filter } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const category = ref((route.query.category as string) || '')

const { data, pending } = await useFetch('/api/analysis', {
  query: computed(() => ({
    page: page.value,
    pageSize: 8,
    category: category.value
  }))
})

const categories = [
  { label: '全部', value: '' },
  { label: '事件追踪', value: '事件追踪' },
  { label: '舆情研判', value: '舆情研判' },
  { label: '深度观察', value: '深度观察' },
  { label: '对比分析', value: '对比分析' }
]

function handleCategoryChange(cat: string) {
  category.value = cat
  page.value = 1
  router.push({ query: { ...route.query, category: cat || undefined, page: 1 } })
}

function handlePageChange(newPage: number) {
  page.value = newPage
  router.push({ query: { ...route.query, page: newPage } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 随机颜色
function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    '事件追踪': '#667eea',
    '舆情研判': '#f59e0b',
    '深度观察': '#10b981',
    '对比分析': '#ef4444'
  }
  return colors[cat] || '#667eea'
}
</script>

<template>
  <div class="analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="title-area">
          <div class="title-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="title-text">
            <h1>舆论分析</h1>
            <p>客观中立的全维度分析，梳理事件来龙去脉，研判舆论整体风向</p>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-value">{{ data?.data?.total || 0 }}</span>
            <span class="stat-label">分析文章</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ categories.length - 1 }}</span>
            <span class="stat-label">分析维度</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-section">
      <div class="filter-label">
        <el-icon><Filter /></el-icon>
        <span>分析维度</span>
      </div>
      <div class="filter-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['filter-tab', { active: category === cat.value }]"
          @click="handleCategoryChange(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- 分析列表 -->
    <div v-if="pending" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="data?.data?.list?.length" class="analysis-grid">
      <div
        v-for="(item, index) in data.data.list"
        :key="item.id"
        class="analysis-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <NuxtLink :to="`/analysis/${item.id}`">
          <!-- 卡片顶部装饰 -->
          <div class="card-accent" :style="{ background: getCategoryColor(item.category) }"></div>

          <div class="card-content">
            <div class="card-header">
              <span class="card-category" :style="{ color: getCategoryColor(item.category), background: `${getCategoryColor(item.category)}15` }">
                {{ item.category }}
              </span>
              <span class="card-date">
                <el-icon><Timer /></el-icon>
                {{ item.published_at?.split('T')[0] }}
              </span>
            </div>

            <h3 class="card-title">{{ item.title }}</h3>

            <p class="card-summary">{{ item.summary }}</p>

            <div class="card-footer">
              <div class="card-stats">
                <span class="stat">
                  <el-icon><View /></el-icon>
                  {{ item.view_count }}
                </span>
                <span class="stat">
                  <el-icon><Star /></el-icon>
                  {{ item.like_count }}
                </span>
                <span class="stat">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ item.comment_count || 0 }}
                </span>
              </div>
              <span class="read-more">
                阅读全文 <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <el-empty v-else description="暂无分析文章" />

    <!-- 分页 -->
    <div v-if="data?.data?.totalPages > 1" class="pagination-section">
      <el-pagination
        v-model:current-page="page"
        :page-size="8"
        :total="data.data.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.analysis-page {
  max-width: 1100px;
  margin: 0 auto;
}

// 页面头部
.page-header {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
    border-radius: 0 20px 20px 0;
  }

  .header-content {
    position: relative;
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
        max-width: 400px;
      }
    }
  }

  .stats-cards {
    display: flex;
    gap: 24px;

    .stat-card {
      text-align: center;
      padding: 16px 24px;
      background: #f8fafc;
      border-radius: 12px;

      .stat-value {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: #f59e0b;
      }

      .stat-label {
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }
}

// 筛选区域
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 20px;

  .filter-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
  }

  .filter-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-tab {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #fef3c7;
      color: #f59e0b;
    }

    &.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
  }
}

// 分析卡片网格
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.analysis-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  transition: all 0.3s ease;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);

    .read-more {
      color: #f59e0b;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .card-accent {
    height: 4px;
  }

  .card-content {
    padding: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .card-category {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 6px;
      }

      .card-date {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #94a3b8;
      }
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-summary {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-stats {
        display: flex;
        gap: 16px;

        .stat {
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
        font-weight: 500;
        color: #64748b;
        transition: color 0.3s ease;
      }
    }
  }
}

// 分页
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .page-header .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>