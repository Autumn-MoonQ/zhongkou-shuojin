import db from '~/server/db'
import type { ApiResponse, User } from '~/types'
import crypto from 'crypto'

// 密码验证
function verifyPassword(password: string, hashedPassword: string): boolean {
  return crypto.createHash('sha256').update(password).digest('hex') === hashedPassword
}

export default defineEventHandler(async (event): Promise<ApiResponse<{ user: User; token: string }>> => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    return { success: false, message: '用户名和密码为必填项' }
  }

  // 查找用户
  const user = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]) as (User & { password: string }) | null

  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  // 验证密码
  if (!verifyPassword(password, user.password)) {
    return { success: false, message: '密码错误' }
  }

  // 检查用户状态
  if (user.status !== 1) {
    return { success: false, message: '账户已被禁用' }
  }

  // 生成token
  const token = crypto.randomBytes(32).toString('hex')

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user

  return {
    success: true,
    data: {
      user: userWithoutPassword as User,
      token
    }
  }
})