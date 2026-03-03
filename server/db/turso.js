import { createClient } from '@libsql/client';
import { allTables } from './schema.js';

// 创建数据库客户端
function createDbClient() {
  // Turso 云数据库配置
  const url = process.env.TURSO_DATABASE_URL || 'file:./data/zhongkou.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken: authToken || undefined
  });
}

let dbClient = null;

// 获取数据库客户端
function getDb() {
  if (!dbClient) {
    dbClient = createDbClient();
  }
  return dbClient;
}

// 初始化数据库表
export async function initDatabase() {
  console.log('正在初始化数据库...');

  const db = getDb();

  for (const createTable of allTables) {
    try {
      await db.execute(createTable);
    } catch (err) {
      // 表可能已存在
    }
  }

  // 插入默认分类数据
  await insertDefaultCategories(db);

  console.log('数据库初始化完成！');
}

// 插入默认分类
async function insertDefaultCategories(db) {
  const categories = [
    // 热点分类
    { name: '社会热点', slug: 'social', type: 'hotspot', sort_order: 1 },
    { name: '科技动态', slug: 'tech', type: 'hotspot', sort_order: 2 },
    { name: '娱乐八卦', slug: 'entertainment', type: 'hotspot', sort_order: 3 },
    { name: '体育赛事', slug: 'sports', type: 'hotspot', sort_order: 4 },
    { name: '财经新闻', slug: 'finance', type: 'hotspot', sort_order: 5 },
    { name: '国际时政', slug: 'international', type: 'hotspot', sort_order: 6 },

    // 舆论分析分类
    { name: '事件追踪', slug: 'tracking', type: 'analysis', sort_order: 1 },
    { name: '舆情研判', slug: 'judgment', type: 'analysis', sort_order: 2 },
    { name: '深度观察', slug: 'observation', type: 'analysis', sort_order: 3 },
    { name: '对比分析', slug: 'comparison', type: 'analysis', sort_order: 4 },

    // 论述题学科分类
    { name: '政治', slug: 'politics', type: 'essay', sort_order: 1 },
    { name: '历史', slug: 'history', type: 'essay', sort_order: 2 },
    { name: '地理', slug: 'geography', type: 'essay', sort_order: 3 },
    { name: '语文', slug: 'chinese', type: 'essay', sort_order: 4 },
    { name: '英语', slug: 'english', type: 'essay', sort_order: 5 }
  ];

  for (const category of categories) {
    try {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES (?, ?, ?, ?)',
        args: [category.name, category.slug, category.type, category.sort_order]
      });
    } catch (err) {
      // 忽略
    }
  }
}

// 数据库操作封装
const database = {
  async run(sql, params = []) {
    const db = getDb();
    const result = await db.execute({
      sql,
      args: params
    });
    return {
      changes: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid
    };
  },

  async get(sql, params = []) {
    const db = getDb();
    const result = await db.execute({
      sql,
      args: params
    });
    return result.rows[0] || null;
  },

  async all(sql, params = []) {
    const db = getDb();
    const result = await db.execute({
      sql,
      args: params
    });
    return result.rows;
  }
};

export default database;