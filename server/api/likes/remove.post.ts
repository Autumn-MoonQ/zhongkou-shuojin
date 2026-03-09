import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  const body = await readBody(event);
  const { likeId, userId, targetType, targetId } = body;

  try {
    let like: any = null;

    if (likeId) {
      // 通过likeId删除
      like = await db.get('SELECT * FROM likes WHERE id = ?', [likeId]);
      if (like) {
        await db.run('DELETE FROM likes WHERE id = ?', [likeId]);
      }
    } else if (userId && targetType && targetId) {
      // 通过userId, targetType, targetId删除
      like = await db.get(`
        SELECT * FROM likes
        WHERE user_id = ? AND target_type = ? AND target_id = ?
      `, [userId, targetType, targetId]);
      if (like) {
        await db.run(`
          DELETE FROM likes
          WHERE user_id = ? AND target_type = ? AND target_id = ?
        `, [userId, targetType, targetId]);
      }
    } else {
      return { success: false, message: '参数不完整' };
    }

    if (!like) {
      return { success: false, message: '点赞记录不存在' };
    }

    // 更新目标的点赞计数
    const tableName = like.target_type === 'hotspot' ? 'hotspots' : like.target_type;
    await db.run(`
      UPDATE ${tableName} SET like_count = like_count - 1 WHERE id = ? AND like_count > 0
    `, [like.target_id]);

    return { success: true, message: '取消点赞成功' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});