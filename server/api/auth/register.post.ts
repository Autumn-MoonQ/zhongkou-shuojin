import db from '~/server/db'
import type { ApiResponse, User } from '~/types'
import crypto from 'crypto'

// 密码加密
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export default defineEventHandler(async (event): Promise<ApiResponse<{ user: User; token: string }>> => {
  const body = await readBody(event)
  const { username, email, password, nickname } = body

  // 验证必填字段
  if (!username || !email || !password) {
    return { success: false, message: '用户名、邮箱和密码为必填项' }
  }

  // 验证用户名格式
  if (username.length < 3 || username.length > 50) {
    return { success: false, message: '用户名长度需在3-50个字符之间' }
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: '邮箱格式不正确' }
  }

  // 验证密码强度
  if (password.length < 6) {
    return { success: false, message: '密码长度至少为6位' }
  }

  // 检查用户名是否已存在
  const existingUser = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email])
  if (existingUser) {
    return { success: false, message: '用户名或邮箱已被注册' }
  }

  // 创建用户
  const hashedPassword = hashPassword(password)

  try {
    const result = await db.run(`
      INSERT INTO users (username, email, password, nickname)
      VALUES (?, ?, ?, ?)
    `, [username, email, hashedPassword, nickname || username])

    // 生成简单token (实际项目中应使用JWT)
    const token = crypto.randomBytes(32).toString('hex')

    // 获取创建的用户
    const user = await db.get(`
      SELECT id, username, email, nickname, avatar, bio, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `, [result.lastInsertRowid]) as User

    return {
      success: true,
      data: { user, token }
    }
  } catch (error) {
    console.error('注册失败:', error)
    return { success: false, message: '注册失败，请稍后重试' }
  }
})