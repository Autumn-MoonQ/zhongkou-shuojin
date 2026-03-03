import db from '~/server/db'
import type { ApiResponse, Hotspot } from '~/types'

export default defineEventHandler(async (event): Promise<ApiResponse<Hotspot>> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    return { success: false, message: '缺少ID参数' }
  }

  const hotspot = await db.get('SELECT * FROM hotspots WHERE id = ? AND status = 1', [id]) as Hotspot | null

  if (!hotspot) {
    return { success: false, message: '热点不存在' }
  }

  // 增加浏览量
  await db.run('UPDATE hotspots SET view_count = view_count + 1 WHERE id = ?', [id])

  return { success: true, data: hotspot }
})