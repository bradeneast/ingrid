const options = require('./options.js');
const { addGarnish, hydrate } = require('./parse.js');
const { join, basename } = require('path');
const { warning, notify } = require('./logger.js');
const {
  dynamicSort,
  matchTag,
  getAttributes,
  readLocal
} = require('./utils.js');

function render({ filename, props }, tree) {

  let { src, dist } = options;
  let { content, href } = props.sys;
  let matchEach = matchTag('Each');
  let depth = 0;

  function getSortParameter(string = 'sys.href') {
    let reverse = '';
    if (string[0] == '-') {
      reverse = '-';
      string = string.slice(1);
    }
    return reverse + 'props.' + string;
  }

  // Parse <Each> Elements
  while (matchEach.test(content)) {

    if (depth > 99) break;
    depth++;

    content = content.replace(matchEach, string => {

      let attrs = getAttributes(string);
      let warningThrown = false;

      if (!attrs.match) {
        warning(props.sys.href, '<Each> elements require a `match` attribute whose value is a Regular Expression to match page paths.');
        warningThrown = true;
      }
      if (!attrs.from) {
        warning(props.sys.href, '<Each> elements require a `from` attribute whose value is a path to a file. The file is hydrated and appended for every page that matches the `match` attribute.');
        warningThrown = true;
      }
      if (warningThrown) return '';

      let path = attrs.from.trim();
      let pathPrefix = /^\./.test(path) ? href : '';
      let importContent = readLocal(join(src, path, pathPrefix));

      if (/\{\*\s*\*\}/.test(importContent)) {
        notify(path, `Empty starburns {* *}`);
      }

      if (/\{%\s*%\}/.test(importContent)) {
        notify(path, `Empty nunjucks {% %}`);
      }

      let matchPattern = new RegExp(attrs.match.trim());
      let matchingPages = tree.filter(p => matchPattern.test(p.props.sys.href)) || [];
      let sortParam = getSortParameter(attrs.sort);
      let sortedPages = matchingPages.sort(dynamicSort(sortParam));

      return sortedPages
        .map((page, i) => {
          let props = page.props;
          let nextPage = sortedPages[i + 1];
          let previousPage = sortedPages[i - 1];
          if (nextPage) props.sys.next = nextPage.props;
          if (previousPage) props.sys.previous = previousPage.props;
          return hydrate(importContent, props);
        })
        .join('')
    })
  }

  return {
    destination: filename.replace(basename(src), basename(dist)),
    content: addGarnish(content, props).trim(),
  }
}

module.exports = render;