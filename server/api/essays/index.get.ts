import db from '~/server/db'
import type { ApiResponse, PaginatedResponse, Essay } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<PaginatedResponse<Essay>>> => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const subject = query.subject as string
  const difficulty = query.difficulty as string
  const search = query.search as string

  let whereClause = 'status = 1'
  const params: (string | number)[] = []

  if (subject) {
    whereClause += ' AND subject = ?'
    params.push(subject)
  }

  if (difficulty) {
    whereClause += ' AND difficulty = ?'
    params.push(difficulty)
  }

  if (search) {
    whereClause += ' AND (title LIKE ? OR question LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  // 获取总数
  const countResult = await db.get(`SELECT COUNT(*) as total FROM essays WHERE ${whereClause}`, params) as { total: number }
  const total = countResult?.total || 0

  // 获取分页数据
  const offset = (page - 1) * pageSize
  const list = await db.all(`
    SELECT * FROM essays
    WHERE ${whereClause}
    ORDER BY published_at DESC, created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, pageSize, offset]) as Essay[]

  return {
    success: true,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }
})