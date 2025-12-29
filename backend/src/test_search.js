const { buildIndex, search } = require('./services/searchService');

async function test() {
  console.log('Testing Search Service...');
  await buildIndex();
  
  const query = 'SDL';
  console.log(`Searching for "${query}"...`);
  const results = search(query);
  
  if (results.length > 0) {
    console.log(`Found ${results.length} results.`);
    console.log('Top result:', results[0].title);
    console.log('Snippet:', results[0].snippet);
  } else {
    console.log('No results found.');
  }

  const query2 = '环境';
  console.log(`Searching for "${query2}"...`);
  const results2 = search(query2);
  console.log(`Found ${results2.length} results for "${query2}"`);
}

test();
