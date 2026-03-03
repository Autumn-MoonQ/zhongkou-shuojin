import db from '~/server/db'
import type { ApiResponse, PaginatedResponse, Analysis } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<PaginatedResponse<Analysis>>> => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 10
  const category = query.category as string
  const search = query.search as string

  let whereClause = 'status = 1'
  const params: (string | number)[] = []

  if (category) {
    whereClause += ' AND category = ?'
    params.push(category)
  }

  if (search) {
    whereClause += ' AND (title LIKE ? OR summary LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  // 获取总数
  const countResult = await db.get(`SELECT COUNT(*) as total FROM analysis WHERE ${whereClause}`, params) as { total: number }
  const total = countResult?.total || 0

  // 获取分页数据
  const offset = (page - 1) * pageSize
  const list = await db.all(`
    SELECT * FROM analysis
    WHERE ${whereClause}
    ORDER BY published_at DESC, created_at DESC
    LIMIT ? OFFSET ?
  `, [...params, pageSize, offset]) as Analysis[]

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