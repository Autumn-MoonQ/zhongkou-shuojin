import db from '~/server/db/index.js';

// 分类检测
function detectCategory(title, desc = '') {
  const text = (title + ' ' + desc).toLowerCase();

  if (/娱乐|明星|电影|电视剧|综艺|演员|歌手|导演|票房|出轨|结婚|离婚|恋情/.test(text)) return '娱乐八卦';
  if (/体育|足球|篮球|nba|世界杯|奥运会|比赛|球员|球队|冠军|联赛/.test(text)) return '体育赛事';
  if (/科技|手机|电脑|ai|人工智能|芯片|互联网|软件|硬件|app|微信|支付宝|抖音|小米|华为|苹果|特斯拉/.test(text)) return '科技动态';
  if (/股市|股票|基金|财经|经济|金融|投资|理财|银行|货币|房价|楼市/.test(text)) return '财经新闻';
  if (/国际|美国|日本|韩国|俄罗斯|欧洲|总统|外交|战争|联合国/.test(text)) return '国际时政';

  return '社会热点';
}

// 微博热搜爬取
async function fetchWeiboHot() {
  try {
    const response = await fetch('https://weibo.com/ajax/side/hotSearch', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://weibo.com'
      }
    });

    const data = await response.json();

    if (data.ok && data.data?.realtime) {
      return data.data.realtime.slice(0, 20).map((item, index) => ({
        title: item.word || item.note,
        summary: item.note || `微博热搜第${index + 1}名`,
        source: '微博热搜',
        source_url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word)}`,
        category: detectCategory(item.word, item.note),
        view_count: Math.floor(Math.random() * 10000),
        like_count: Math.floor(Math.random() * 1000)
      }));
    }
  } catch (error) {
    console.error('微博热搜获取失败:', error.message);
  }
  return [];
}

// 百度热搜爬取
async function fetchBaiduHot() {
  try {
    const response = await fetch('https://top.baidu.com/api/board?platform=wise&tab=realtime', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    if (data.data?.cards?.[0]?.content) {
      return data.data.cards[0].content.slice(0, 20).map((item, index) => ({
        title: item.word || item.query,
        summary: item.desc || item.wordDesc || '百度热搜话题',
        source: '百度热搜',
        source_url: item.url || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word)}`,
        category: detectCategory(item.word, item.desc),
        view_count: Math.floor(Math.random() * 10000),
        like_count: Math.floor(Math.random() * 1000)
      }));
    }
  } catch (error) {
    console.error('百度热搜获取失败:', error.message);
  }
  return [];
}

// 生成舆论分析
function generateAnalysis(hotspot) {
  const categories = ['事件追踪', '舆情研判', '深度观察'];
  const category = categories[Math.floor(Math.random() * categories.length)];

  return {
    title: `【舆论分析】${hotspot.title}`,
    summary: `针对"${hotspot.title}"这一热点话题的深度舆论分析。`,
    category,
    content: `【事件概述】\n${hotspot.title}成为近期网络热点话题，引发广泛关注和讨论。\n\n【舆论反应】\n网络上对此事件的讨论呈现多元态势，各方观点不一。\n\n【深度分析】\n该事件折射出当前社会关注的焦点问题，值得深入思考。`,
    view_count: Math.floor(Math.random() * 5000),
    like_count: Math.floor(Math.random() * 500)
  };
}

// 生成论述题
function generateEssay(hotspot) {
  const subjects = ['政治', '历史', '语文'];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const difficulties = ['easy', 'medium', 'hard'];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

  return {
    title: `${subject}论述：${hotspot.title}`,
    subject,
    question: `结合"${hotspot.title}"这一热点，运用所学知识进行分析论述。`,
    analysis: `【题目分析】\n本题考查学生的分析能力和综合素养。\n\n【解题思路】\n1. 明确核心概念\n2. 分析问题本质\n3. 提出解决思路`,
    answer: `【参考答案】\n${hotspot.title}是当前社会关注的热点问题，反映了社会发展的某些特点。\n\n从多角度分析，我们可以看到...\n\n综上所述，我们需要理性看待这一问题。`,
    difficulty,
    keywords: `${subject},热点分析,论述题`,
    view_count: Math.floor(Math.random() * 3000),
    like_count: Math.floor(Math.random() * 300),
    favorite_count: Math.floor(Math.random() * 200)
  };
}

export default defineEventHandler(async () => {
  try {
    console.log('开始爬取数据...');

    // 爬取热点
    const weiboData = await fetchWeiboHot();
    const baiduData = await fetchBaiduHot();
    const allHotspots = [...weiboData, ...baiduData];

    // 去重
    const uniqueHotspots = [];
    const titles = new Set();
    for (const item of allHotspots) {
      if (!titles.has(item.title)) {
        titles.add(item.title);
        uniqueHotspots.push(item);
      }
    }

    // 保存热点
    let savedHotspots = 0;
    const now = new Date().toISOString();

    for (const item of uniqueHotspots) {
      try {
        await db.run(`
          INSERT INTO hotspots (title, summary, source, source_url, category, tags, view_count, like_count, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [item.title, item.summary, item.source, item.source_url, item.category, `热点,${item.source}`, item.view_count, item.like_count, now, now, now]);
        savedHotspots++;
      } catch (err) {
        // 忽略重复
      }
    }

    // 生成舆论分析
    let savedAnalysis = 0;
    for (const item of uniqueHotspots.slice(0, 15)) {
      const analysis = generateAnalysis(item);
      try {
        await db.run(`
          INSERT INTO analysis (title, summary, content, category, tags, view_count, like_count, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [analysis.title, analysis.summary, analysis.content, analysis.category, '舆论分析,深度解读', analysis.view_count, analysis.like_count, now, now, now]);
        savedAnalysis++;
      } catch (err) {
        // 忽略
      }
    }

    // 生成论述题
    let savedEssays = 0;
    for (const item of uniqueHotspots.slice(0, 10)) {
      const essay = generateEssay(item);
      try {
        await db.run(`
          INSERT INTO essays (title, subject, question, analysis, answer, keywords, difficulty, tags, view_count, like_count, favorite_count, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [essay.title, essay.subject, essay.question, essay.analysis, essay.answer, essay.keywords, essay.difficulty, `论述题,${essay.subject}`, essay.view_count, essay.like_count, essay.favorite_count, now, now, now]);
        savedEssays++;
      } catch (err) {
        // 忽略
      }
    }

    return {
      success: true,
      message: '数据爬取完成',
      data: {
        hotspots: savedHotspots,
        analysis: savedAnalysis,
        essays: savedEssays
      }
    };
  } catch (error: any) {
    console.error('爬取失败:', error);
    return { success: false, message: error.message };
  }
});