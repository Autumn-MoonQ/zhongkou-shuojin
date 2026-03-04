import db from '~/server/db'
import type { ApiResponse, User } from '~/types'

interface OnlineUser {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
}

export default defineEventHandler(async (event): Promise<ApiResponse<OnlineUser[]>> => {
  // 查询30秒内活动的用户
  const users = await db.all(`
    SELECT u.id, u.username, u.nickname, u.avatar
    FROM users u
    INNER JOIN online_users ou ON u.id = ou.user_id
    WHERE ou.last_activity_at >= datetime('now', '-30 seconds')
    AND u.status = 1
    ORDER BY ou.last_activity_at DESC
    LIMIT 20
  `) as OnlineUser[]

  return { success: true, data: users }
})