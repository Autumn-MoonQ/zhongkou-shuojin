<script setup lang="ts">
import { User, Lock, ArrowRight } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'simple'
})

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!form.username || !form.password) {
    errorMsg.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const result = await userStore.login(form.username, form.password)
    if (result.success) {
      router.push('/')
    } else {
      errorMsg.value = result.message || '登录失败'
    }
  } catch (error) {
    errorMsg.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo区域 -->
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">众</div>
          <span class="logo-text">众口铄金</span>
        </div>
        <h2>欢迎回来</h2>
        <p>登录您的账号，探索热点话题</p>
      </div>

      <!-- 表单区域 -->
      <el-form :model="form" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名或邮箱"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-group">
          <label>密码</label>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </div>

        <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" show-icon class="error-alert" />

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="submit-btn"
          native-type="submit"
        >
          <span>登录</span>
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </el-form>

      <!-- 底部链接 -->
      <div class="login-footer">
        <span>还没有账号？</span>
        <NuxtLink to="/register">立即注册</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 700;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 8px;
  }

  p {
    color: #94a3b8;
    font-size: 14px;
    margin: 0;
  }
}

.login-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
      margin-bottom: 8px;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    padding: 4px 16px;
  }

  .error-alert {
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      opacity: 0.9;
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 14px;

  a {
    color: #667eea;
    font-weight: 500;
    text-decoration: none;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>