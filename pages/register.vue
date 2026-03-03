<script setup lang="ts">
import { User, Lock, Message, UserFilled, ArrowRight } from '@element-plus/icons-vue'

definePageMeta({
  layout: 'simple'
})

const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

const loading = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  // 验证
  if (!form.username || !form.email || !form.password) {
    errorMsg.value = '请填写所有必填项'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = '密码长度至少为6位'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.username,
        email: form.email,
        password: form.password,
        nickname: form.nickname || form.username
      }
    })

    if (response.success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      errorMsg.value = response.message || '注册失败'
    }
  } catch (error: any) {
    errorMsg.value = error.data?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo区域 -->
      <div class="register-header">
        <div class="logo">
          <div class="logo-icon">众</div>
          <span class="logo-text">众口铄金</span>
        </div>
        <h2>创建账号</h2>
        <p>加入我们，探索热点话题</p>
      </div>

      <!-- 表单区域 -->
      <el-form :model="form" class="register-form" @submit.prevent="handleRegister">
        <div class="form-row">
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <el-input v-model="form.username" placeholder="请输入用户名" size="large">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="form-group">
            <label>邮箱 <span class="required">*</span></label>
            <el-input v-model="form.email" placeholder="请输入邮箱" size="large">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="form-group">
          <label>昵称</label>
          <el-input v-model="form.nickname" placeholder="选填，默认为用户名" size="large">
            <template #prefix>
              <el-icon><UserFilled /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>密码 <span class="required">*</span></label>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="至少6位"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" show-icon class="error-alert" />

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="submit-btn"
          native-type="submit"
        >
          <span>注册</span>
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </el-form>

      <!-- 底部链接 -->
      <div class="register-footer">
        <span>已有账号？</span>
        <NuxtLink to="/login">立即登录</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;

    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 700;
    }

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
    }
  }

  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 6px;
  }

  p {
    color: #94a3b8;
    font-size: 14px;
    margin: 0;
  }
}

.register-form {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      margin-bottom: 6px;

      .required {
        color: #ef4444;
      }
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    padding: 2px 14px;
  }

  .error-alert {
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .submit-btn {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;

    &:hover {
      opacity: 0.9;
    }
  }
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
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

@media (max-width: 480px) {
  .register-form .form-row {
    grid-template-columns: 1fr;
  }
}
</style>