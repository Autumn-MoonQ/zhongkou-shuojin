import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const body = await readBody(event);
  const { favoriteId } = body;

  if (!favoriteId) {
    return { success: false, message: '收藏ID无效' };
  }

  try {
    // 删除收藏
    const result = await db.run('DELETE FROM favorites WHERE id = ?', [favoriteId]);

    if (result.changes === 0) {
      return { success: false, message: '收藏不存在' };
    }

    return { success: true, message: '取消收藏成功' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});