const { src } = require('./options.js');
const { hydrate } = require('./hydrators.js');
const { warning, notify } = require('./loggers.js');
const { join } = require('path');
const {
  dynamicSort,
  matchTag,
  getAttributes,
  readLocal,
  getSortParameter
} = require('./utils.js');


function Eachs(pageMap) {

  let matchEach = matchTag('Each');

  return pageMap.map(({ filename, props }) => {

    let depth = 0;

    // Parse <Each> Elements
    while (matchEach.test(props.sys.content)) {

      if (depth > 99) break;
      depth++;

      props.sys.content = props.sys.content.replace(matchEach, string => {

        let attrs = getAttributes(string);
        let warningThrown = false;

        if (!attrs.match) {
          warning(filename, '<Each> elements require a `match` attribute whose value is a Regular Expression to match page paths.');
          warningThrown = true;
        }
        if (!attrs.from) {
          warning(filename, '<Each> elements require a `from` attribute whose value is a path to a file. The file is hydrated and appended for every page that matches the `match` attribute.');
          warningThrown = true;
        }
        if (warningThrown) return '';

        let path = attrs.from.trim();
        let pathPrefix = /^\./.test(path) ? props.sys.href : '';
        let importContent = readLocal(join(src, path, pathPrefix));

        if (/\{\*\s*\*\}/.test(importContent)) {
          notify(path, `Empty starburns {* *}`);
        }

        if (/\{%\s*%\}/.test(importContent)) {
          notify(path, `Empty nunjucks {% %}`);
        }

        let matchPattern = new RegExp(attrs.match.trim());
        let matchingPages = pageMap.filter(p => matchPattern.test(p.props.sys.href)) || [];
        let sortParam = getSortParameter(attrs.sort);
        let sortedPages = matchingPages.sort(dynamicSort(sortParam));
        let countParam = attrs.count;
        let startIndex = 0;
        let endIndex = sortedPages.length;

        // Split into start and end indeces if count parameter is a comma-separated pair
        if (countParam && countParam != 'undefined') {
          let indeces = countParam.split(/, */);
          if (indeces.length > 1) {
            startIndex = parseInt(indeces[0]);
            endIndex = parseInt(indeces[1]);
          }
          if (indeces.length == 1) {
            endIndex = parseInt(countParam);
          }
          if (typeof startIndex != 'number' || typeof endIndex != 'number') {
            warning(filename, 'The `count` attribute on <Each> elements must be an integer or comma-separated pair of integers.\nExample: `count="5"` or `count="3,8"');
          }
        }

        let slicedPages = sortedPages.slice(startIndex, endIndex);
        let hydratedPages = slicedPages.map((page, i) => {
          let props = page.props;
          let nextPage = slicedPages[i + 1];
          let previousPage = slicedPages[i - 1];
          if (nextPage) props.sys.next = nextPage.props;
          if (previousPage) props.sys.previous = previousPage.props;
          return hydrate(importContent, props);
        })

        return hydratedPages.join('')
      })
    }

    return {
      filename: filename,
      props: props
    }

  })
}

module.exports = Eachs;