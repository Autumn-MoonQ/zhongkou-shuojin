/**
 * 数据爬取模块
 * 对接公开热点数据源
 */

import db from '../db/index.js';

// 爬取配置
const SOURCES = {
  weibo: {
    name: '微博热搜',
    url: 'https://weibo.com/ajax/side/hotSearch',
    enabled: true
  },
  zhihu: {
    name: '知乎热榜',
    url: 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total',
    enabled: true
  },
  baidu: {
    name: '百度热搜',
    url: 'https://top.baidu.com/board?tab=realtime',
    enabled: true
  }
};

// 分类映射
const CATEGORY_MAP = {
  '娱乐': '娱乐八卦',
  '体育': '体育赛事',
  '科技': '科技动态',
  '财经': '财经新闻',
  '社会': '社会热点',
  '国际': '国际时政',
  '政治': '国际时政',
  '历史': '历史',
  '教育': '社会热点'
};

// 自动分类
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
    const response = await fetch(SOURCES.weibo.url, {
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
        hot_value: item.num || 0,
        rank: index + 1
      }));
    }
  } catch (error) {
    console.error('微博热搜获取失败:', error.message);
  }
  return [];
}

// 知乎热榜爬取
async function fetchZhihuHot() {
  try {
    const response = await fetch(SOURCES.zhihu.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    if (data.data) {
      return data.data.slice(0, 20).map((item, index) => {
        const target = item.target || {};
        return {
          title: target.title || item.title,
          summary: target.excerpt || target.description || '知乎热榜话题',
          source: '知乎热榜',
          source_url: target.url || `https://www.zhihu.com/question/${target.id}`,
          category: detectCategory(target.title, target.excerpt),
          hot_value: item.detail_text || item.hot_value || 0,
          rank: index + 1
        };
      });
    }
  } catch (error) {
    console.error('知乎热榜获取失败:', error.message);
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
        hot_value: item.hotScore || item.show || 0,
        rank: index + 1
      }));
    }
  } catch (error) {
    console.error('百度热搜获取失败:', error.message);
  }
  return [];
}

// 生成舆论分析内容
function generateAnalysis(hotspot) {
  const templates = [
    {
      category: '事件追踪',
      template: `【事件概述】
${hotspot.title}成为近期网络热点话题，引发广泛关注和讨论。

【事件经过】
该事件起源于网络平台的传播，迅速引发网友热议。根据网络信息显示，事件涉及多个层面，各方观点不一。

【舆论反应】
网络上对此事件的讨论呈现两极分化态势。一部分网友认为此事反映了社会发展的某些问题，另一部分则持不同观点。

【深度分析】
从社会层面来看，该事件折射出当前社会关注的焦点问题。媒体的报道和网友的讨论，体现了公众对社会议题的参与热情。`
    },
    {
      category: '舆情研判',
      template: `【舆情概览】
${hotspot.title}在各大社交平台引发热议，话题热度持续攀升。

【传播路径】
该话题首先在微博平台发酵，随后扩散至知乎、抖音等平台，形成跨平台传播态势。

【情绪分析】
通过对网络评论的分析，公众情绪以关注和讨论为主，部分网友表达了担忧和建议。

【趋势研判】
预计该话题在未来一段时间内仍将保持较高关注度，建议持续关注事件发展。`
    },
    {
      category: '深度观察',
      template: `【现象透视】
${hotspot.title}引发社会广泛讨论，反映出公众对相关议题的高度关注。

【社会意义】
这一现象背后，折射出社会发展过程中的诸多问题，值得我们深入思考和探讨。

【多方视角】
从不同角度审视这一事件，可以获得更全面的认识。专家、媒体、公众各有不同的关注点和解读方式。

【未来展望】
如何从这一事件中汲取经验教训，推动社会进步，是我们需要共同思考的问题。`
    }
  ];

  const selected = templates[Math.floor(Math.random() * templates.length)];
  return {
    title: `【舆论分析】${hotspot.title}`,
    summary: `针对"${hotspot.title}"这一热点话题的深度舆论分析，从多角度解读事件背后的社会意义。`,
    category: selected.category,
    content: selected.template,
    hotspot_title: hotspot.title
  };
}

// 生成论述题
function generateEssay(hotspot) {
  const subjects = ['政治', '历史', '语文'];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const essayTemplates = {
    政治: [
      {
        question: `结合"${hotspot.title}"这一社会热点，运用所学政治知识，分析其反映的社会问题及解决对策。`,
        analysis: `【题目分析】
本题考查学生对社会热点问题的分析能力和政治学科核心素养。

【解题思路】
1. 首先，明确事件涉及的政治学概念和原理
2. 其次，运用所学知识分析事件的原因和影响
3. 最后，提出合理的解决建议

【答题要点】
1. 政府职能角度：政府在事件中应发挥的作用
2. 公民意识角度：公民应如何理性参与社会事务
3. 法治建设角度：如何通过法治方式解决相关问题`,
        answer: `【参考答案】
"${hotspot.title}"是当前社会关注的热点问题，反映了我国社会发展过程中的某些现象。

从政府职能角度分析，政府应当加强相关领域的管理和服务，完善制度机制，保障人民权益。

从公民意识角度分析，公民应当增强法治意识，理性表达诉求，依法维护自身权益。

从社会发展角度分析，需要统筹各方利益，推动问题得到妥善解决。

总之，我们要以积极的态度面对社会发展中的问题，共同推动社会进步。`
      }
    ],
    历史: [
      {
        question: `以"${hotspot.title}"为切入点，论述当代中国社会发展的特点。`,
        analysis: `【题目分析】
本题要求学生结合现实热点，运用历史唯物主义的观点分析社会发展规律。

【解题思路】
1. 回顾相关历史背景
2. 分析事件的历史意义
3. 总结历史经验教训

【关键词】
历史发展、社会变迁、时代特征`,
        answer: `【参考答案】
从历史发展的角度来看，"${hotspot.title}"反映了当代中国社会发展的某些特点。

首先，这一现象的出现有其深刻的历史背景。改革开放以来，中国社会发生了巨大变革...

其次，从历史规律来看，任何社会现象都有其必然性...

最后，我们要以史为鉴，从历史经验中汲取智慧...`
      }
    ],
    语文: [
      {
        question: `阅读以下材料，根据要求写作。\n\n材料：${hotspot.title}\n\n要求：结合材料内容，选好角度，确定立意，明确文体，自拟标题；不要套作，不得抄袭；不少于800字。`,
        analysis: `【审题指导】
这是一道新材料作文题。材料关注社会热点，考查学生的思辨能力和表达能力。

【立意方向】
1. 从社会发展角度立意
2. 从个人成长角度立意
3. 从价值观念角度立意

【写作建议】
1. 开头要简明扼要，引出观点
2. 主体要有层次，论证充分
3. 结尾要点题，升华主题`,
        answer: `【范文思路】
标题：《时代变迁中的思考》

开头：以材料引入，提出自己的观点。

主体段落：
第一段：分析现象产生的原因...
第二段：探讨现象背后的深层问题...
第三段：提出解决问题的思考...

结尾：总结全文，呼应开头，展望未来。`
      }
    ]
  };

  const templates = essayTemplates[subject];
  const selected = templates[Math.floor(Math.random() * templates.length)];

  return {
    title: `${subject}论述：${hotspot.title}`,
    subject,
    question: selected.question,
    analysis: selected.analysis,
    answer: selected.answer,
    difficulty: Math.random() > 0.6 ? 'hard' : Math.random() > 0.3 ? 'medium' : 'easy',
    keywords: `${subject},热点分析,论述题`
  };
}

// 保存热点到数据库
async function saveHotspots(hotspots) {
  let saved = 0;
  const now = new Date().toISOString();

  for (const item of hotspots) {
    try {
      // 检查是否已存在
      const existing = await db.get(
        'SELECT id FROM hotspots WHERE title = ?',
        [item.title]
      );

      if (!existing) {
        await db.run(`
          INSERT INTO hotspots (title, summary, source, source_url, category, tags, view_count, like_count, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `, [
          item.title,
          item.summary,
          item.source,
          item.source_url,
          item.category,
          `热点,${item.source}`,
          Math.floor(Math.random() * 10000),
          Math.floor(Math.random() * 1000),
          now,
          now,
          now
        ]);
        saved++;
      }
    } catch (error) {
      console.error('保存热点失败:', error.message);
    }
  }

  return saved;
}

// 保存分析文章
async function saveAnalysis(analysisList) {
  let saved = 0;
  const now = new Date().toISOString();

  for (const item of analysisList) {
    try {
      await db.run(`
        INSERT INTO analysis (title, summary, content, category, tags, view_count, like_count, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `, [
        item.title,
        item.summary,
        item.content,
        item.category,
        '舆论分析,深度解读',
        Math.floor(Math.random() * 5000),
        Math.floor(Math.random() * 500),
        now,
        now,
        now
      ]);
      saved++;
    } catch (error) {
      console.error('保存分析失败:', error.message);
    }
  }

  return saved;
}

// 保存论述题
async function saveEssays(essays) {
  let saved = 0;
  const now = new Date().toISOString();

  for (const item of essays) {
    try {
      await db.run(`
        INSERT INTO essays (title, subject, question, analysis, answer, keywords, difficulty, tags, view_count, like_count, favorite_count, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `, [
        item.title,
        item.subject,
        item.question,
        item.analysis,
        item.answer,
        item.keywords,
        item.difficulty,
        `论述题,${item.subject}`,
        Math.floor(Math.random() * 3000),
        Math.floor(Math.random() * 300),
        Math.floor(Math.random() * 200),
        now,
        now,
        now
      ]);
      saved++;
    } catch (error) {
      console.error('保存论述题失败:', error.message);
    }
  }

  return saved;
}

// 主爬取函数
export async function crawlAll() {
  console.log('开始爬取数据...\n');

  // 爬取各平台热搜
  console.log('1. 爬取微博热搜...');
  const weiboData = await fetchWeiboHot();
  console.log(`   获取 ${weiboData.length} 条\n`);

  console.log('2. 爬取知乎热榜...');
  const zhihuData = await fetchZhihuHot();
  console.log(`   获取 ${zhihuData.length} 条\n`);

  console.log('3. 爬取百度热搜...');
  const baiduData = await fetchBaiduHot();
  console.log(`   获取 ${baiduData.length} 条\n`);

  // 合并并去重
  const allHotspots = [...weiboData, ...zhihuData, ...baiduData];
  const uniqueHotspots = [];
  const titles = new Set();

  for (const item of allHotspots) {
    if (!titles.has(item.title)) {
      titles.add(item.title);
      uniqueHotspots.push(item);
    }
  }

  // 保存热点
  console.log('4. 保存热点数据...');
  const savedHotspots = await saveHotspots(uniqueHotspots);
  console.log(`   新增 ${savedHotspots} 条\n`);

  // 生成舆论分析
  console.log('5. 生成舆论分析...');
  const analysisList = uniqueHotspots.slice(0, 15).map(h => generateAnalysis(h));
  const savedAnalysis = await saveAnalysis(analysisList);
  console.log(`   新增 ${savedAnalysis} 条\n`);

  // 生成论述题
  console.log('6. 生成论述题...');
  const essays = uniqueHotspots.slice(0, 10).map(h => generateEssay(h));
  const savedEssays = await saveEssays(essays);
  console.log(`   新增 ${savedEssays} 条\n`);

  console.log('========================================');
  console.log('数据爬取完成！');
  console.log(`热点: +${savedHotspots} 条`);
  console.log(`分析: +${savedAnalysis} 条`);
  console.log(`论述题: +${savedEssays} 条`);
  console.log('========================================');
}

// 直接运行
crawlAll().catch(console.error);