<script setup lang="ts">
import { TrendCharts, View, Star, ChatDotRound, Search, ArrowRight, Filter } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const category = ref((route.query.category as string) || '')
const search = ref('')
const searchInput = ref('')

const { data, pending, refresh } = await useFetch('/api/hotspots', {
  query: computed(() => ({
    page: page.value,
    pageSize: 12,
    category: category.value,
    search: search.value
  }))
})

// 分类选项
const categories = [
  { label: '全部', value: '', icon: 'Apps' },
  { label: '社会热点', value: '社会热点', icon: 'User' },
  { label: '科技动态', value: '科技动态', icon: 'Monitor' },
  { label: '娱乐八卦', value: '娱乐八卦', icon: 'VideoPlay' },
  { label: '体育赛事', value: '体育赛事', icon: 'Trophy' },
  { label: '财经新闻', value: '财经新闻', icon: 'Money' },
  { label: '国际时政', value: '国际时政', icon: 'Globe' }
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

function handleSearch() {
  search.value = searchInput.value
  page.value = 1
  refresh()
}

// 热度等级
function getHeatLevel(views: number) {
  if (views > 8000) return { label: '爆', class: 'hot-explosive' }
  if (views > 5000) return { label: '热', class: 'hot-very' }
  if (views > 2000) return { label: '暖', class: 'hot-warm' }
  return null
}
</script>

<template>
  <div class="hotspots-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <div class="title-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="title-text">
            <h1>热点整合</h1>
            <p>聚焦当下全网热门话题，打破平台信息壁垒，掌握最新热点动态</p>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchInput"
            placeholder="搜索热点话题..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-section">
      <div class="filter-label">
        <el-icon><Filter /></el-icon>
        <span>分类筛选</span>
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

    <!-- 热点列表 -->
    <div v-if="pending" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="data?.data?.list?.length" class="hotspots-list">
      <div
        v-for="(item, index) in data.data.list"
        :key="item.id"
        class="hotspot-item"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <NuxtLink :to="`/hotspots/${item.id}`" class="item-link">
          <div class="item-rank" :class="{ 'rank-1': (page - 1) * 12 + index === 0, 'rank-2': (page - 1) * 12 + index === 1, 'rank-3': (page - 1) * 12 + index === 2 }">
            <span class="rank-num">{{ (page - 1) * 12 + index + 1 }}</span>
          </div>

          <div class="item-content">
            <div class="item-header">
              <span class="item-category">{{ item.category }}</span>
              <span class="item-source">{{ item.source }}</span>
              <span v-if="getHeatLevel(item.view_count)" :class="['heat-badge', getHeatLevel(item.view_count).class]">
                {{ getHeatLevel(item.view_count).label }}
              </span>
            </div>

            <h3 class="item-title">{{ item.title }}</h3>

            <p class="item-summary">{{ item.summary }}</p>

            <div class="item-footer">
              <div class="item-stats">
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
              <span class="item-arrow">
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <el-empty v-else description="暂无热点数据" />

    <!-- 分页 -->
    <div v-if="data?.data?.totalPages > 1" class="pagination-section">
      <el-pagination
        v-model:current-page="page"
        :page-size="12"
        :total="data.data.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hotspots-page {
  max-width: 1000px;
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
    gap: 24px;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea, #764ba2);
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

  .search-box {
    width: 400px;

    :deep(.el-input__wrapper) {
      border-radius: 12px;
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
      background: #f1f5f9;
      color: #667eea;
    }

    &.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
}

// 热点列表
.hotspots-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hotspot-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;

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
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);

    .item-arrow {
      transform: translateX(4px);
    }
  }

  .item-link {
    display: flex;
    text-decoration: none;
    color: inherit;
  }

  .item-rank {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;

    .rank-num {
      font-size: 20px;
      font-weight: 700;
      color: #94a3b8;
    }

    // 金牌 - 第一名
    &.rank-1 {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);

      .rank-num {
        color: #5D4E37;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.4);
      }
    }

    // 银牌 - 第二名
    &.rank-2 {
      background: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%);

      .rank-num {
        color: #4A4A4A;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
      }
    }

    // 铜牌 - 第三名
    &.rank-3 {
      background: linear-gradient(135deg, #CD7F32 0%, #B87333 50%, #A0522D 100%);

      .rank-num {
        color: #F5F5DC;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .item-content {
    flex: 1;
    padding: 20px 24px;

    .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;

      .item-category {
        font-size: 12px;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 500;
      }

      .item-source {
        font-size: 12px;
        color: #94a3b8;
      }

      .heat-badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;

        &.hot-explosive {
          background: #fee2e2;
          color: #dc2626;
        }

        &.hot-very {
          background: #fef3c7;
          color: #d97706;
        }

        &.hot-warm {
          background: #dbeafe;
          color: #2563eb;
        }
      }
    }

    .item-title {
      font-size: 17px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px;
      line-height: 1.4;
    }

    .item-summary {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 12px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-stats {
        display: flex;
        gap: 20px;

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #94a3b8;
        }
      }

      .item-arrow {
        color: #667eea;
        font-size: 18px;
        transition: transform 0.3s ease;
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
  .page-header {
    .header-content {
      flex-direction: column;
      align-items: stretch;
    }

    .search-box {
      width: 100%;
    }
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .hotspot-item .item-rank {
    width: 50px;
  }
}
</style>