import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const body = await readBody(event);
  const { userId, targetType, targetId } = body;

  if (!userId || !targetType || !targetId) {
    return { success: false, message: '参数不完整' };
  }

  if (!['hotspot', 'analysis', 'essay'].includes(targetType)) {
    return { success: false, message: '类型无效' };
  }

  try {
    // 检查是否已收藏
    const existing = await db.get(`
      SELECT id FROM favorites
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `, [userId, targetType, targetId]);

    if (existing) {
      return { success: false, message: '已收藏' };
    }

    // 添加收藏
    await db.run(`
      INSERT INTO favorites (user_id, target_type, target_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [userId, targetType, targetId]);

    return { success: true, message: '收藏成功' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});