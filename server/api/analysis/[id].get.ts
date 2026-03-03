import db from '~/server/db'
import type { ApiResponse, Analysis } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<Analysis>> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { success: false, message: '缺少ID参数' }
  }

  const analysis = await db.get('SELECT * FROM analysis WHERE id = ? AND status = 1', [id]) as Analysis | null

  if (!analysis) {
    return { success: false, message: '分析文章不存在' }
  }

  // 增加浏览量
  await db.run('UPDATE analysis SET view_count = view_count + 1 WHERE id = ?', [id])

  return { success: true, data: analysis }
})