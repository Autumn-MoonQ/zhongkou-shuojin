import db from '~/server/db'
import type { ApiResponse, User } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<User>> => {
  // 从请求头获取token
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, message: '未登录' }
  }

  // 在实际项目中，这里应该验证JWT token
  // 为了简化，我们直接从查询参数获取用户ID
  const query = getQuery(event)
  const userId = query.userId

  if (!userId) {
    return { success: false, message: '无效的用户信息' }
  }

  const user = await db.get(`
    SELECT id, username, email, nickname, avatar, bio, role, status, created_at, updated_at
    FROM users WHERE id = ?
  `, [userId]) as User | null

  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  return { success: true, data: user }
})