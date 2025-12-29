const { courses } = require('./data/courseData');
const { readMarkdownFile } = require('./utils/fileUtils');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, '../../debug_output.txt');

function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
}

async function debugPaths() {
  log('Debugging Paths...');
  log('Current __dirname: ' + __dirname);
  log('Root Dir relative resolution: ' + path.resolve(__dirname, '../..'));

  try {
    const course = courses[0];
    if (course && course.parts && course.parts.length > 0) {
      const part = course.parts[0];
      log('Testing Part: ' + part.title);
      log('Content Path: ' + part.contentPath);
      
      const rootDir = path.resolve(__dirname, '../..');
      const fullPath = path.join(rootDir, part.contentPath);
      log('Resolved Full Path: ' + fullPath);
      
      if (fs.existsSync(fullPath)) {
        log('File EXISTS.');
        const content = await readMarkdownFile(part.contentPath);
        log('Read Success! Length: ' + content.length);
      } else {
        log('File DOES NOT EXIST.');
      }
    } else {
      log('No courses or parts found.');
    }
  } catch (e) {
    log('Error: ' + e.message);
    log(e.stack);
  }
}

// Clear previous log
fs.writeFileSync(logFile, '');
debugPaths();
