import db from '~/server/db'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { success: false, message: '用户ID无效' }
  }

  try {
    const user = await db.get(`
      SELECT id, username, nickname, avatar, bio, role, created_at
      FROM users WHERE id = ? AND status = 1
    `, [id])

    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})