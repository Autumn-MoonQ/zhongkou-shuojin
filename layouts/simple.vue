<script setup lang="ts">
// 简洁布局，用于登录、注册等页面
</script>

<template>
  <el-container class="simple-layout">
    <el-main>
      <slot />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.simple-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .el-main {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}
</style>