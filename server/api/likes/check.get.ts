import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const query = getQuery(event);
  const { userId, targetType, targetId } = query;

  if (!userId || !targetType || !targetId) {
    return { success: false, message: '参数不完整' };
  }

  if (!['hotspot', 'analysis', 'essay'].includes(targetType as string)) {
    return { success: false, message: '类型无效' };
  }

  try {
    const like = await db.get(`
      SELECT id FROM likes
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `, [userId, targetType, targetId]);

    return {
      success: true,
      data: {
        isLiked: !!like,
        likeId: like?.id || null
      }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});