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
    // 检查是否已点赞
    const existing = await db.get(`
      SELECT id FROM likes
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `, [userId, targetType, targetId]);

    if (existing) {
      return { success: false, message: '已点赞', data: { likeId: existing.id } };
    }

    // 添加点赞记录
    const result = await db.run(`
      INSERT INTO likes (user_id, target_type, target_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [userId, targetType, targetId]);

    // 更新目标的点赞计数
    const tableName = targetType === 'hotspot' ? 'hotspots' : targetType;
    await db.run(`
      UPDATE ${tableName} SET like_count = like_count + 1 WHERE id = ?
    `, [targetId]);

    return { success: true, message: '点赞成功', data: { likeId: result.lastID } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});