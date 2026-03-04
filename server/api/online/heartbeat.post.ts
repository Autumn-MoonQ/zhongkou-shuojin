import db from '~/server/db'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<{ online: boolean }>> => {
  // 从请求头获取token
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, message: '未登录' }
  }

  const token = authHeader.substring(7)

  // 获取请求体中的用户ID
  const body = await readBody(event)
  const { userId } = body

  if (!userId) {
    return { success: false, message: '用户ID无效' }
  }

  // 更新或插入在线状态记录
  const existingRecord = await db.get(
    'SELECT id FROM online_users WHERE user_id = ?',
    [userId]
  )

  if (existingRecord) {
    // 更新最后活动时间
    await db.run(
      'UPDATE online_users SET last_activity_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [userId]
    )
  } else {
    // 插入新记录
    await db.run(
      'INSERT INTO online_users (user_id, last_activity_at) VALUES (?, CURRENT_TIMESTAMP)',
      [userId]
    )
  }

  return { success: true, data: { online: true } }
})