<script setup lang="ts">
import { Document, View, Star, Filter, Search, Reading, ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const subject = ref((route.query.subject as string) || '')
const difficulty = ref((route.query.difficulty as string) || '')
const search = ref('')
const searchInput = ref('')

const { data, pending, refresh } = await useFetch('/api/essays', {
  query: computed(() => ({
    page: page.value,
    pageSize: 9,
    subject: subject.value,
    difficulty: difficulty.value,
    search: search.value
  }))
})

const subjects = [
  { label: '全部', value: '' },
  { label: '政治', value: '政治' },
  { label: '历史', value: '历史' },
  { label: '地理', value: '地理' },
  { label: '语文', value: '语文' },
  { label: '英语', value: '英语' }
]

const difficulties = [
  { label: '全部', value: '' },
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

function handleSubjectChange(sub: string) {
  subject.value = sub
  page.value = 1
  router.push({ query: { ...route.query, subject: sub || undefined, page: 1 } })
}

function handleDifficultyChange(diff: string) {
  difficulty.value = diff
  page.value = 1
  router.push({ query: { ...route.query, difficulty: diff || undefined, page: 1 } })
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

function getDifficultyInfo(diff: string) {
  const info: Record<string, { label: string; class: string; color: string }> = {
    easy: { label: '简单', class: 'diff-easy', color: '#10b981' },
    medium: { label: '中等', class: 'diff-medium', color: '#f59e0b' },
    hard: { label: '困难', class: 'diff-hard', color: '#ef4444' }
  }
  return info[diff] || info.medium
}

function getSubjectColor(subj: string) {
  const colors: Record<string, string> = {
    '政治': '#667eea',
    '历史': '#f59e0b',
    '地理': '#10b981',
    '语文': '#ef4444',
    '英语': '#8b5cf6'
  }
  return colors[subj] || '#667eea'
}
</script>

<template>
  <div class="essays-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-area">
          <div class="title-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="title-text">
            <h1>论述题解析</h1>
            <p>深入剖析文科论述题的核心内涵、逻辑框架与作答思路</p>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchInput"
            placeholder="搜索论述题..."
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

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">
            <el-icon><Reading /></el-icon>
            学科
          </span>
          <div class="filter-tabs">
            <button
              v-for="sub in subjects"
              :key="sub.value"
              :class="['filter-tab', { active: subject === sub.value }]"
              @click="handleSubjectChange(sub.value)"
            >
              {{ sub.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">
            <el-icon><Filter /></el-icon>
            难度
          </span>
          <div class="filter-tabs">
            <button
              v-for="diff in difficulties"
              :key="diff.value"
              :class="['filter-tab', `diff-${diff.value || 'all'}`, { active: difficulty === diff.value }]"
              @click="handleDifficultyChange(diff.value)"
            >
              {{ diff.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 论述题列表 -->
    <div v-if="pending" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="data?.data?.list?.length" class="essays-grid">
      <div
        v-for="(item, index) in data.data.list"
        :key="item.id"
        class="essay-card"
        :style="{ animationDelay: `${index * 0.08}s` }"
      >
        <NuxtLink :to="`/essays/${item.id}`">
          <!-- 学科标签 -->
          <div class="essay-subject-tag" :style="{ background: getSubjectColor(item.subject) }">
            {{ item.subject }}
          </div>

          <div class="essay-content">
            <div class="essay-header">
              <span class="essay-difficulty" :class="getDifficultyInfo(item.difficulty).class">
                {{ getDifficultyInfo(item.difficulty).label }}
              </span>
            </div>

            <h3 class="essay-title">{{ item.title }}</h3>

            <p class="essay-question">{{ item.question?.substring(0, 100) }}...</p>

            <div class="essay-footer">
              <div class="essay-stats">
                <span class="stat">
                  <el-icon><View /></el-icon>
                  {{ item.view_count }}
                </span>
                <span class="stat">
                  <el-icon><Star /></el-icon>
                  {{ item.favorite_count }}
                </span>
              </div>
              <span class="start-btn">
                开始学习
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <el-empty v-else description="暂无论述题数据" />

    <!-- 分页 -->
    <div v-if="data?.data?.totalPages > 1" class="pagination-section">
      <el-pagination
        v-model:current-page="page"
        :page-size="9"
        :total="data.data.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.essays-page {
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
    gap: 24px;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 16px;

    .title-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #10b981, #059669);
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
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  .filter-row {
    display: flex;
    gap: 40px;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .filter-label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .filter-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-tab {
    padding: 8px 16px;
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
    }

    &.active {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    &.diff-easy.active {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    &.diff-medium.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    &.diff-hard.active {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }
}

// 论述题网格
.essays-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.essay-card {
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

    .start-btn {
      color: #10b981;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
    display: block;
    position: relative;
  }

  .essay-subject-tag {
    position: absolute;
    top: 0;
    right: 0;
    padding: 6px 16px;
    border-radius: 0 16px 0 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
  }

  .essay-content {
    padding: 24px;
    padding-top: 32px;

    .essay-header {
      margin-bottom: 12px;
    }

    .essay-difficulty {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;

      &.diff-easy {
        background: #dcfce7;
        color: #16a34a;
      }

      &.diff-medium {
        background: #fef3c7;
        color: #d97706;
      }

      &.diff-hard {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .essay-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      padding-right: 60px;
    }

    .essay-question {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 20px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .essay-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .essay-stats {
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

      .start-btn {
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

@media (max-width: 992px) {
  .essays-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .filter-section {
    .filter-row {
      flex-direction: column;
      gap: 16px;
    }

    .filter-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  .essays-grid {
    grid-template-columns: 1fr;
  }
}
</style>