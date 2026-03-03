import { initDatabase } from './index.js';

console.log('开始初始化数据库...');
initDatabase().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});