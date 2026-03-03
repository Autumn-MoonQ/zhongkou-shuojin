<script setup lang="ts">
const userStore = useUserStore()
const router = useRouter()

// 如果未登录，跳转到登录页
if (!userStore.isLoggedIn) {
  router.push('/login')
}

const { data: userFavorites } = await useFetch('/api/user/favorites', {
  query: computed(() => ({ userId: userStore.user?.id }))
})
</script>

<template>
  <div class="user-profile page-container">
    <div class="profile-header">
      <el-avatar :size="80" :src="userStore.user?.avatar">
        {{ userStore.username?.charAt(0) }}
      </el-avatar>
      <div class="profile-info">
        <h1>{{ userStore.username }}</h1>
        <p class="email">{{ userStore.user?.email }}</p>
        <p class="bio">{{ userStore.user?.bio || '这个人很懒，什么都没写...' }}</p>
      </div>
      <el-button type="primary" plain>
        <NuxtLink to="/user/settings">编辑资料</NuxtLink>
      </el-button>
    </div>

    <el-tabs class="profile-tabs">
      <el-tab-pane label="我的收藏">
        <div v-if="userFavorites?.data?.length" class="favorites-grid">
          <el-card v-for="item in userFavorites.data" :key="item.id" shadow="hover">
            <NuxtLink :to="`/${item.type}/${item.id}`">
              <h4>{{ item.title }}</h4>
              <span class="type">{{ item.type }}</span>
            </NuxtLink>
          </el-card>
        </div>
        <el-empty v-else description="暂无收藏" />
      </el-tab-pane>

      <el-tab-pane label="我的评论">
        <el-empty description="暂无评论" />
      </el-tab-pane>

      <el-tab-pane label="账号设置">
        <el-empty description="功能开发中" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.user-profile {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #fff;
    border-radius: 8px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .profile-info {
      flex: 1;

      h1 {
        margin: 0 0 8px;
        color: #303133;
      }

      .email {
        color: #909399;
        margin: 0 0 8px;
        font-size: 14px;
      }

      .bio {
        color: #606266;
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .profile-tabs {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .el-card a {
      text-decoration: none;
      color: inherit;

      h4 {
        margin: 0 0 8px;
        color: #303133;
      }

      .type {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}
</style>