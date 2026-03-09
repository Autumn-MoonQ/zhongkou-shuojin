<script setup lang="ts">
import { ChatDotRound, Close, Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  essayTitle: string
  essayQuestion: string
}>()

const isExpanded = ref(false)
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// 初始化欢迎消息
onMounted(() => {
  messages.value = [
    {
      role: 'assistant',
      content: `你好！我是你的辅导老师。让我们一起来看看这道论述题吧。\n\n关于"${props.essayTitle}"这个话题，你有什么初步的想法吗？可以先说说你对题目关键词的理解。`
    }
  ]
})

// 发送消息
async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''
  isLoading.value = true

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        messages: messages.value.slice(1), // 不包含欢迎消息
        essayTitle: props.essayTitle,
        essayQuestion: props.essayQuestion
      }
    }) as any

    if (response.success) {
      messages.value.push({ role: 'assistant', content: response.data.reply })
    } else {
      messages.value.push({ role: 'assistant', content: response.message || '抱歉，出了点问题，请稍后再试。' })
    }
  } catch (error) {
    messages.value.push({ role: 'assistant', content: '网络错误，请检查网络连接后重试。' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理回车发送
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="ai-chat-widget">
    <!-- 收起状态的按钮 -->
    <button
      v-if="!isExpanded"
      class="chat-toggle-btn"
      @click="isExpanded = true"
    >
      <el-icon><ChatDotRound /></el-icon>
      <span>AI辅导老师</span>
    </button>

    <!-- 展开状态的聊天窗口 -->
    <div v-else class="chat-panel">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="header-title">
          <div class="avatar">AI</div>
          <span>辅导老师</span>
        </div>
        <button class="close-btn" @click="isExpanded = false">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <!-- 消息区域 -->
      <div ref="messagesContainer" class="messages-container">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-avatar">
            {{ msg.role === 'user' ? '我' : 'AI' }}
          </div>
          <div class="message-content">
            {{ msg.content }}
          </div>
        </div>
        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">AI</div>
          <div class="message-content loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            正在思考...
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <textarea
          v-model="inputMessage"
          placeholder="输入你的想法或回答..."
          @keydown="handleKeydown"
          rows="2"
        />
        <button
          class="send-btn"
          :disabled="!inputMessage.trim() || isLoading"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
  }

  .el-icon {
    font-size: 20px;
  }
}

.chat-panel {
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 15px;

    .avatar {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8fafc;

  .message {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    &.user {
      flex-direction: row-reverse;

      .message-avatar {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .message-content {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
    }

    &.assistant {
      .message-avatar {
        background: #e2e8f0;
        color: #64748b;
      }

      .message-content {
        background: white;
        color: #334155;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message-content {
      max-width: 260px;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;

      &.loading {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;

        .loading-icon {
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

.input-area {
  padding: 12px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;

  textarea {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    resize: none;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #667eea;
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  .send-btn {
    padding: 10px 18px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 32px);
    height: 60vh;
    bottom: 16px;
    right: 16px;
  }
}
</style>