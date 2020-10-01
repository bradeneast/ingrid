import { walkDirSync, matchTag } from './utils.js';
import options from './options.js';
import { parseBrick } from './parse.js';
import fs from 'fs-extra';

let tree = [];
let src = options.paths.src;

fs.ensureDirSync(src);

for (let { filename, content } of walkDirSync(src, options.ignorePattern)) {

  // Ignore non-html files
  if (!/\.html$/i.test(filename)) continue;

  let matchBrick = matchTag('Brick');
  let pageProps = {
    sys: {
      content: content,
      href: filename
        .replace(src, '')
        .replace('index.html', ''),
    },
  }

  // Match and parse all Bricks in the page
  while (matchBrick.test(pageProps.sys.content))
    pageProps.sys.content = pageProps.sys.content
      .replace(matchBrick, string =>
        parseBrick(string, pageProps)
      );

  // Add page to the tree
  tree.push({
    filename: filename,
    props: pageProps
  });
}

export default tree;