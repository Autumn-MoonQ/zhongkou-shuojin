import db from '~/server/db/index.js';
import type { ApiResponse } from '~/types';

export default defineEventHandler(async (event): Promise<ApiResponse<any[]>> => {
  const query = getQuery(event);
  const userId = query.userId as string;
  const type = query.type as string || 'all';

  if (!userId) {
    return { success: false, message: '请先登录' };
  }

  try {
    let favorites = [];

    if (type === 'all' || type === 'hotspot') {
      const hotspots = await db.all(`
        SELECT f.id as favorite_id, 'hotspot' as type, h.id, h.title, h.summary, h.category, h.view_count
        FROM favorites f
        JOIN hotspots h ON f.target_id = h.id
        WHERE f.user_id = ? AND f.target_type = 'hotspot' AND h.status = 1
        ORDER BY f.created_at DESC
      `, [userId]);
      favorites = favorites.concat(hotspots);
    }

    if (type === 'all' || type === 'analysis') {
      const analysis = await db.all(`
        SELECT f.id as favorite_id, 'analysis' as type, a.id, a.title, a.summary, a.category, a.view_count
        FROM favorites f
        JOIN analysis a ON f.target_id = a.id
        WHERE f.user_id = ? AND f.target_type = 'analysis' AND a.status = 1
        ORDER BY f.created_at DESC
      `, [userId]);
      favorites = favorites.concat(analysis);
    }

    if (type === 'all' || type === 'essay') {
      const essays = await db.all(`
        SELECT f.id as favorite_id, 'essay' as type, e.id, e.title, e.subject as category, e.question as summary, e.view_count
        FROM favorites f
        JOIN essays e ON f.target_id = e.id
        WHERE f.user_id = ? AND f.target_type = 'essay' AND e.status = 1
        ORDER BY f.created_at DESC
      `, [userId]);
      favorites = favorites.concat(essays);
    }

    return { success: true, data: favorites };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});