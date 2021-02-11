const { walkDirSync, matchTag } = require('./utils.js');
const { src, ignorePattern } = require('./options.js');
const { parseImport } = require('./parse.js');
const { extname, dirname, basename } = require('path');


function makeTree() {

  let tree = [];
  let matchImport = matchTag('Import');

  for (let { filename, content } of walkDirSync(src, ignorePattern)) {

    if (extname(filename) != '.html')
      continue; // Skip non-html files

    // Initialize the page properties object
    let props = {};
    props.sys = {};
    props.sys.href = dirname(filename.replace(basename(src), ''));
    props.sys.content = content;

    // Match all Import elements in the page
    while (matchImport.test(props.sys.content))
      // Replace Import elements with their target file contents
      // Props are passed down to be updated as each Import is parsed
      props.sys.content = props.sys.content
        .replace(matchImport, string => parseImport(string, props));

    // Add page to the tree
    tree.push({
      filename: filename,
      props: props
    })
  }

  return tree;
}


module.exports = makeTree;