export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, essayTitle, essayQuestion } = body

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { success: false, message: 'DeepSeek API Key未配置' }
  }

  // 系统提示词 - AI扮演辅导老师
  const systemPrompt = `你是一位资深的辅导老师，正在帮助学生理解和分析论述题。

当前论述题题目：
【标题】${essayTitle}
【题目内容】${essayQuestion}

你的任务是：
1. 以引导式提问的方式，帮助学生深入思考问题
2. 不要直接给出答案，而是通过提问引导学生自己思考
3. 对学生的回答给予积极反馈，并指出可以改进的地方
4. 如果学生的回答有偏差，温和地引导他们回到正确的思考方向
5. 可以从不同角度提问，帮助学生建立全面的思维框架
6. 语言要亲切自然，像一位耐心的老师

请用中文交流，每次回复控制在200字以内。`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek API Error:', errorData)
      return { success: false, message: 'AI服务暂时不可用，请稍后重试' }
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解你的问题，可以换种方式问吗？'

    return { success: true, data: { reply } }
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return { success: false, message: '网络错误，请检查网络连接' }
  }
})