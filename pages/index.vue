<script setup lang="ts">
import { HomeFilled, TrendCharts, DataAnalysis, Document, User, ArrowRight, View, Star, ChatDotRound, Clock, Reading, AlarmClock } from '@element-plus/icons-vue'

const { data: hotspots } = await useFetch('/api/hotspots', {
  query: { pageSize: 6 }
})

const { data: analysisList } = await useFetch('/api/analysis', {
  query: { pageSize: 4 }
})

const { data: essays } = await useFetch('/api/essays', {
  query: { pageSize: 6 }
})

// 统计数据 - 使用真实数据
const stats = computed(() => [
  { label: '热点话题', value: hotspots.value?.data?.total || 0, icon: 'TrendCharts', color: '#667eea' },
  { label: '舆论分析', value: analysisList.value?.data?.total || 0, icon: 'DataAnalysis', color: '#f59e0b' },
  { label: '论述题', value: essays.value?.data?.total || 0, icon: 'Document', color: '#10b981' },
  { label: '访问量', value: '12,345', icon: 'User', color: '#ef4444' }
])

// 功能特色
const features = [
  {
    icon: 'TrendCharts',
    title: '热点整合',
    desc: '聚焦全网热门话题，打破平台信息壁垒',
    color: '#667eea'
  },
  {
    icon: 'DataAnalysis',
    title: '舆论分析',
    desc: '客观中立的全维度分析，研判舆论风向',
    color: '#f59e0b'
  },
  {
    icon: 'Document',
    title: '论述题解析',
    desc: '深入剖析题目内涵，提供专业解题指导',
    color: '#10b981'
  }
]
</script>

<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <el-icon><TrendCharts /></el-icon>
          <span>新媒体时代内容平台</span>
        </div>
        <h1 class="hero-title">
          <span class="highlight">众口铄金</span>
        </h1>
        <p class="hero-subtitle">热点整合 · 舆论分析 · 论述题深度解析</p>
        <p class="hero-desc">
          立足新媒体时代信息传播特点，打造集热点整合、舆论分析、文科论述题深度解析于一体的专业内容体系
        </p>
        <div class="hero-actions">
          <NuxtLink to="/hotspots" class="btn-primary">
            <span>探索热点</span>
            <el-icon><ArrowRight /></el-icon>
          </NuxtLink>
          <NuxtLink to="/essays" class="btn-secondary">
            <el-icon><Reading /></el-icon>
            <span>学习论述</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)` }">
            <el-icon :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features">
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" :style="{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}cc)` }">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 热点整合 -->
    <section class="section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="title-icon"><TrendCharts /></el-icon>
          <h2>热门话题</h2>
        </div>
        <NuxtLink to="/hotspots" class="more-link">
          <span>查看更多</span>
          <el-icon><ArrowRight /></el-icon>
        </NuxtLink>
      </div>
      <div class="hotspots-grid">
        <div v-for="(item, index) in hotspots?.data?.list || []" :key="item.id" class="hotspot-card">
          <NuxtLink :to="`/hotspots/${item.id}`">
            <div class="card-rank" :class="{ 'top-3': index < 3 }">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-category">{{ item.category }}</span>
                <span class="card-source">{{ item.source }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <div class="card-stats">
                <span class="stat">
                  <el-icon><View /></el-icon>
                  {{ item.view_count }}
                </span>
                <span class="stat">
                  <el-icon><Star /></el-icon>
                  {{ item.like_count }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 舆论分析 -->
    <section class="section analysis-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="title-icon analysis-icon"><DataAnalysis /></el-icon>
          <h2>舆论分析</h2>
        </div>
        <NuxtLink to="/analysis" class="more-link">
          <span>查看更多</span>
          <el-icon><ArrowRight /></el-icon>
        </NuxtLink>
      </div>
      <div class="analysis-grid">
        <div v-for="item in analysisList?.data?.list || []" :key="item.id" class="analysis-card">
          <NuxtLink :to="`/analysis/${item.id}`">
            <div class="analysis-category">{{ item.category }}</div>
            <h3>{{ item.title }}</h3>
            <p class="analysis-summary">{{ item.summary }}</p>
            <div class="analysis-meta">
              <span class="date">
                <el-icon><Clock /></el-icon>
                {{ item.published_at?.split('T')[0] }}
              </span>
              <span class="views">
                <el-icon><View /></el-icon>
                {{ item.view_count }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 论述题解析 -->
    <section class="section essays-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon class="title-icon essay-icon"><Document /></el-icon>
          <h2>论述题解析</h2>
        </div>
        <NuxtLink to="/essays" class="more-link">
          <span>查看更多</span>
          <el-icon><ArrowRight /></el-icon>
        </NuxtLink>
      </div>
      <div class="essays-grid">
        <div v-for="item in essays?.data?.list || []" :key="item.id" class="essay-card">
          <NuxtLink :to="`/essays/${item.id}`">
            <div class="essay-header">
              <span class="essay-subject">{{ item.subject }}</span>
              <span class="essay-difficulty" :class="item.difficulty">
                {{ item.difficulty === 'easy' ? '简单' : item.difficulty === 'hard' ? '困难' : '中等' }}
              </span>
            </div>
            <h3>{{ item.title }}</h3>
            <p class="essay-preview">{{ item.question?.substring(0, 80) }}...</p>
            <div class="essay-footer">
              <div class="essay-stats">
                <span><el-icon><View /></el-icon> {{ item.view_count }}</span>
                <span><el-icon><Star /></el-icon> {{ item.favorite_count }}</span>
              </div>
              <span class="essay-link">
                开始学习 <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  max-width: 1280px;
  margin: 0 auto;
}

// Hero 区域
.hero {
  position: relative;
  padding: 60px 40px 80px;
  margin: -32px -32px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40px 40px;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;

    .hero-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: white;
      top: -100px;
      right: -100px;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: white;
      bottom: -150px;
      left: 10%;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: white;
      top: 50%;
      right: 20%;
    }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 30px;
    font-size: 14px;
    margin-bottom: 24px;
    backdrop-filter: blur(10px);
  }

  .hero-title {
    font-size: 56px;
    font-weight: 800;
    margin: 0 0 16px;
    letter-spacing: 8px;

    .highlight {
      background: linear-gradient(90deg, #fff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }
  }

  .hero-subtitle {
    font-size: 22px;
    margin: 0 0 16px;
    opacity: 0.95;
    letter-spacing: 4px;
  }

  .hero-desc {
    font-size: 15px;
    opacity: 0.85;
    max-width: 600px;
    margin: 0 auto 32px;
    line-height: 1.8;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    justify-content: center;

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: white;
      color: #667eea;
      border-radius: 30px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      }
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-radius: 30px;
      font-weight: 600;
      text-decoration: none;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-3px);
      }
    }
  }
}

// 统计数据
.stats {
  margin-bottom: 48px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 26px;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      .stat-label {
        font-size: 13px;
        color: #94a3b8;
        margin-top: 4px;
      }
    }
  }
}

// 功能特色
.features {
  margin-bottom: 48px;

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .feature-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;

      .el-icon {
        font-size: 28px;
      }
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px;
    }

    p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.6;
    }
  }
}

// 通用区块
.section {
  margin-bottom: 48px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .title-icon {
        font-size: 24px;
        color: #667eea;
      }

      .analysis-icon {
        color: #f59e0b;
      }

      .essay-icon {
        color: #10b981;
      }

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }
    }

    .more-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }
}

// 热点卡片
.hotspots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.hotspot-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }

  a {
    display: flex;
    text-decoration: none;
    color: inherit;
  }

  .card-rank {
    width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    font-size: 20px;
    font-weight: 700;
    color: #94a3b8;

    &.top-3 {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
  }

  .card-content {
    flex: 1;
    padding: 16px;

    .card-header {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;

      .card-category {
        font-size: 12px;
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 4px 10px;
        border-radius: 4px;
      }

      .card-source {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

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
  }
}

// 分析卡片
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.analysis-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border-left: 4px solid #f59e0b;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .analysis-category {
    display: inline-block;
    font-size: 12px;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    padding: 4px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 12px;
    line-height: 1.4;
  }

  .analysis-summary {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .analysis-meta {
    display: flex;
    gap: 20px;
    font-size: 12px;
    color: #94a3b8;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// 论述题卡片
.essays-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.essay-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);

    .essay-link {
      color: #10b981;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .essay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .essay-subject {
      font-size: 12px;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 4px 10px;
      border-radius: 4px;
    }

    .essay-difficulty {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;

      &.easy {
        background: #dcfce7;
        color: #16a34a;
      }

      &.medium {
        background: #fef3c7;
        color: #d97706;
      }

      &.hard {
        background: #fee2e2;
        color: #dc2626;
      }
    }
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 10px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .essay-preview {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0 0 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .essay-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .essay-stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #94a3b8;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .essay-link {
      font-size: 12px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.3s ease;
    }
  }
}

@media (max-width: 992px) {
  .stats .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features .features-grid {
    grid-template-columns: 1fr;
  }

  .hotspots-grid,
  .essays-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 24px 60px;

    .hero-title {
      font-size: 36px;
      letter-spacing: 4px;
    }

    .hero-subtitle {
      font-size: 16px;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }
  }

  .stats .stats-grid,
  .hotspots-grid,
  .analysis-grid,
  .essays-grid {
    grid-template-columns: 1fr;
  }
}
</style>