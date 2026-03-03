<script setup lang="ts">
const route = useRoute()
const id = route.params.id

const { data, pending } = await useFetch(`/api/essays/${id}`)

const activeTab = ref('analysis')

function formatDate(dateStr: string) {
  return dateStr?.split('T')[0] || ''
}

function getDifficultyLabel(diff: string) {
  return diff === 'easy' ? '简单' : diff === 'hard' ? '困难' : '中等'
}

function getDifficultyType(diff: string) {
  return diff === 'easy' ? 'success' : diff === 'hard' ? 'danger' : 'warning'
}
</script>

<template>
  <div class="essay-detail page-container">
    <div v-if="pending" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="data?.success && data.data">
      <article class="main-content">
        <!-- 题目头部 -->
        <header class="article-header">
          <div class="header-tags">
            <el-tag :type="getDifficultyType(data.data.difficulty)">
              {{ getDifficultyLabel(data.data.difficulty) }}
            </el-tag>
            <el-tag type="info">{{ data.data.subject }}</el-tag>
          </div>
          <h1>{{ data.data.title }}</h1>
          <div class="meta">
            <span>发布时间：{{ formatDate(data.data.published_at || data.data.created_at) }}</span>
            <span>
              <el-icon><View /></el-icon>
              {{ data.data.view_count }} 次浏览
            </span>
            <span>
              <el-icon><Star /></el-icon>
              {{ data.data.favorite_count }} 次收藏
            </span>
          </div>
        </header>

        <!-- 题目内容 -->
        <section class="question-section">
          <h2><el-icon><Document /></el-icon> 题目</h2>
          <div class="question-content">
            {{ data.data.question }}
          </div>
        </section>

        <!-- 关键词 -->
        <section v-if="data.data.keywords" class="keywords-section">
          <h3>关键词</h3>
          <div class="keywords">
            <el-tag v-for="keyword in data.data.keywords.split(',')" :key="keyword" size="large">
              {{ keyword }}
            </el-tag>
          </div>
        </section>

        <!-- 解析内容 -->
        <el-tabs v-model="activeTab" class="content-tabs">
          <el-tab-pane label="深度解析" name="analysis">
            <div class="tab-content">
              <div v-if="data.data.analysis" class="analysis-content article-content" v-html="data.data.analysis" />
              <el-empty v-else description="暂无解析内容" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="参考答案" name="answer">
            <div class="tab-content">
              <div v-if="data.data.answer" class="answer-content article-content" v-html="data.data.answer" />
              <el-empty v-else description="暂无参考答案" />
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 标签和操作 -->
        <footer class="article-footer">
          <div class="tags" v-if="data.data.tags">
            <el-tag v-for="tag in data.data.tags.split(',')" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
          <div class="actions">
            <el-button type="primary">
              <el-icon><Star /></el-icon>
              收藏
            </el-button>
            <el-button>
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </footer>
      </article>
    </template>

    <el-empty v-else description="论述题不存在" />
  </div>
</template>

<style lang="scss" scoped>
.essay-detail {
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
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      h1 {
        font-size: 26px;
        color: #303133;
        margin-bottom: 16px;
        line-height: 1.4;
      }

      .meta {
        display: flex;
        gap: 24px;
        color: #909399;
        font-size: 14px;
        flex-wrap: wrap;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .question-section {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      border-left: 4px solid #667eea;

      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #303133;
        margin-bottom: 16px;
        font-size: 18px;
      }

      .question-content {
        color: #303133;
        line-height: 1.8;
        font-size: 16px;
      }
    }

    .keywords-section {
      margin-bottom: 24px;

      h3 {
        color: #606266;
        margin-bottom: 12px;
        font-size: 14px;
      }

      .keywords {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }

    .content-tabs {
      margin-bottom: 24px;

      .tab-content {
        padding: 24px 0;
        min-height: 200px;
      }

      .analysis-content,
      .answer-content {
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

        ul, ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        li {
          margin-bottom: 8px;
        }
      }
    }

    .article-footer {
      padding-top: 24px;
      border-top: 1px solid #ebeef5;

      .tags {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .actions {
        display: flex;
        gap: 12px;
      }
    }
  }
}
</style>