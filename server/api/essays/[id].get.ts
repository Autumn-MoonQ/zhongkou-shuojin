import db from '~/server/db'
import type { ApiResponse, Essay } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<Essay>> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { success: false, message: '缺少ID参数' }
  }

  const essay = await db.get('SELECT * FROM essays WHERE id = ? AND status = 1', [id]) as Essay | null

  if (!essay) {
    return { success: false, message: '论述题不存在' }
  }

  // 增加浏览量
  await db.run('UPDATE essays SET view_count = view_count + 1 WHERE id = ?', [id])

  return { success: true, data: essay }
})