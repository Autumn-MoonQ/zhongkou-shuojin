<script setup lang="ts">
const route = useRoute()
const id = route.params.id

const { data, pending } = await useFetch(`/api/analysis/${id}`)

function formatDate(dateStr: string) {
  return dateStr?.split('T')[0] || ''
}
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
            <el-button type="primary">
              <el-icon><Star /></el-icon>
              收藏
            </el-button>
            <el-button>
              <el-icon><ChatDotRound /></el-icon>
              评论
            </el-button>
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
      }
    }
  }
}
</style>