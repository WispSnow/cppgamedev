const fs = require('fs');
const path = require('path');
const util = require('util');

// 将fs.readFile转换为Promise版本
const readFile = util.promisify(fs.readFile);

/**
 * 从指定路径读取Markdown文件内容
 * @param {string} filePath - Markdown文件路径，可以是相对路径或绝对路径
 * @returns {Promise<string>} - 返回文件内容的Promise
 */
async function readMarkdownFile(filePath) {
  try {
    // 获取项目根目录路径
    const rootDir = path.resolve(__dirname, '../../..');
    
    // 如果路径以backend开头，则视为相对于项目根目录的路径
    const fullPath = filePath.startsWith('backend') 
      ? path.join(rootDir, filePath)
      : path.resolve(__dirname, filePath);
      
    const content = await readFile(fullPath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading markdown file: ${filePath}`, error);
    throw new Error(`Unable to read markdown file: ${filePath}`);
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径，可以是相对路径或绝对路径
 * @returns {boolean} - 文件是否存在
 */
function fileExists(filePath) {
  // 获取项目根目录路径
  const rootDir = path.resolve(__dirname, '../../..');
  
  // 如果路径以backend开头，则视为相对于项目根目录的路径
  const fullPath = filePath.startsWith('backend') 
    ? path.join(rootDir, filePath)
    : path.resolve(__dirname, filePath);
    
  return fs.existsSync(fullPath);
}

module.exports = {
  readMarkdownFile,
  fileExists
}; 