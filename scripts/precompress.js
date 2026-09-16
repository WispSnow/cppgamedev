/**
 * 构建产物里的文本文件各生成一份 .br（brotli），nginx 的 brotli_static 会直接发给支持的浏览器。
 * 前端 `npm run build` 之后会自动执行（见 frontend/package.json 的 postbuild），
 * 用 Node 自带的 zlib，不增加依赖；服务器上不做压缩，CI 构建时一次压好随 rsync 上传。
 * 小于 1KB 的文件跳过（和 nginx 的 gzip_min_length 一致），压了也省不下什么。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
// CRA 支持用 BUILD_PATH 改构建目录；绝对路径也能正确解析
const buildDir = path.resolve(root, 'frontend', process.env.BUILD_PATH || 'build');
const EXTENSIONS = new Set(['.js', '.css', '.html', '.json', '.svg', '.xml', '.txt', '.md']);
const MIN_BYTES = 1024;

const walk = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

if (!fs.existsSync(buildDir)) {
  console.error(`没有找到构建目录：${buildDir}`);
  process.exit(1);
}

let count = 0;
let rawTotal = 0;
let brotliTotal = 0;

for (const file of walk(buildDir)) {
  // 已经是 .br 的文件扩展名就是 .br，不会再进来
  if (!EXTENSIONS.has(path.extname(file))) continue;
  const raw = fs.readFileSync(file);
  if (raw.length < MIN_BYTES) continue;

  const compressed = zlib.brotliCompressSync(raw, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });
  fs.writeFileSync(`${file}.br`, compressed);
  count += 1;
  rawTotal += raw.length;
  brotliTotal += compressed.length;
}

const kb = bytes => (bytes / 1024).toFixed(0);
console.log(
  count
    ? `已生成 ${count} 个 .br 文件：${kb(rawTotal)}KB → ${kb(brotliTotal)}KB（-${Math.round((1 - brotliTotal / rawTotal) * 100)}%）`
    : '没有需要压缩的文件'
);
