/**
 * 根据课程数据生成 frontend/public/sitemap.xml。
 * 前端 `npm run build` 之前会自动执行（见 frontend/package.json 的 prebuild），
 * 新增课程或章节后无需手动维护 sitemap。
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://cppgamedev.top';
const root = path.resolve(__dirname, '..');
const { courses } = require(path.join(root, 'backend/src/data/courseData'));
const { troubleshootingArticles } = require(path.join(root, 'backend/src/data/troubleshootingData'));

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/mainline', changefreq: 'weekly', priority: '0.9' },
  { loc: '/side-quests', changefreq: 'weekly', priority: '0.8' },
  { loc: '/courses', changefreq: 'weekly', priority: '0.8' },
  { loc: '/roadmap', changefreq: 'monthly', priority: '0.7' },
  { loc: '/projects', changefreq: 'monthly', priority: '0.7' },
  { loc: '/troubleshooting', changefreq: 'monthly', priority: '0.6' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.5' },
  { loc: '/about', changefreq: 'yearly', priority: '0.4' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.4' },
];

const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '');
const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urls = [...staticPages];

for (const course of courses) {
  // 章节没有单独的更新时间，沿用课程的 updateAt
  const lastmod = isDate(course.updateAt) ? course.updateAt : undefined;
  urls.push({ loc: `/courses/${course.id}`, lastmod, changefreq: 'weekly', priority: '0.8' });
  for (const part of course.parts) {
    urls.push({ loc: `/courses/${course.id}/parts/${part.id}`, lastmod, changefreq: 'monthly', priority: '0.6' });
  }
}

for (const article of troubleshootingArticles) {
  urls.push({ loc: `/troubleshooting/${article.id}`, changefreq: 'monthly', priority: '0.5' });
}

// 作品数据在前端的 TypeScript 文件里，这个脚本 require 不了，只能按 id 字段取；
// 一条都没取到就报错，免得改了数据文件后 sitemap 悄悄漏掉作品页
const projectsSource = fs.readFileSync(path.join(root, 'frontend/src/data/projectsData.ts'), 'utf8');
const projectIds = [...new Set([...projectsSource.matchAll(/^\s+id: '([a-z0-9-]+)',$/gm)].map(match => match[1]))];
if (projectIds.length === 0) {
  throw new Error('没有从 frontend/src/data/projectsData.ts 解析出作品 id');
}

for (const id of projectIds) {
  urls.push({ loc: `/projects/${id}`, changefreq: 'monthly', priority: '0.6' });
}

const entries = urls.map(({ loc, lastmod, changefreq, priority }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + encodeURI(loc))}</loc>`,
    lastmod && `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'frontend/public/sitemap.xml'), xml);
console.log(`sitemap.xml 已生成，共 ${urls.length} 个 URL`);
