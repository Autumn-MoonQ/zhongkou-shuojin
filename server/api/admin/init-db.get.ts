import { initDatabase } from '~/server/db/index.js';

export default defineEventHandler(async () => {
  try {
    await initDatabase();
    return { success: true, message: '数据库初始化成功' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});