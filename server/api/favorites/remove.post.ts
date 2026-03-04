import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const body = await readBody(event);
  const { favoriteId } = body;

  if (!favoriteId) {
    return { success: false, message: '收藏ID无效' };
  }

  try {
    // 获取收藏信息，用于更新计数
    const favorite = await db.get<{
      user_id: number;
      target_type: string;
      target_id: number;
    }>(
      'SELECT user_id, target_type, target_id FROM favorites WHERE id = ?',
      [favoriteId]
    );

    if (!favorite) {
      return { success: false, message: '收藏不存在' };
    }

    // 删除收藏
    await db.run('DELETE FROM favorites WHERE id = ?', [favoriteId]);

    // 更新收藏计数
    const tableName = favorite.target_type === 'hotspot'
      ? 'hotspots'
      : favorite.target_type === 'analysis'
        ? 'analysis'
        : 'essays';

    await db.run(`
      UPDATE ${tableName}
      SET favorite_count = CASE
        WHEN favorite_count > 0 THEN favorite_count - 1
        ELSE 0
      END
      WHERE id = ?
    `, [favorite.target_id]);

    return { success: true, message: '取消收藏成功' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});