const { src } = require('./options.js');
const { hydrate } = require('./hydrators.js');
const { warning, notify } = require('./loggers.js');
const { join } = require('path');
const { dynamicSort, uniqueID, getAttributes, readLocal, getSortParameter } = require('./utils.js');
const matchers = require('./matchers.js');


function getScopes(pageMap) {

  let scopes = [];

  pageMap.map(({ filename, props }) => {

    props.sys.content = props.sys.content.replace(matchers.each, each => {

      let scope = { id: uniqueID(), pages: [] };
      let attrs = getAttributes(each);

      if (!attrs.match) {
        warning(filename, '<Each> elements require a `match` attribute whose value is a Regular Expression to match page paths.');
        return each;
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
      scope.pages = slicedPages
        .map((page, i) => {
          let props = page.props;
          let nextPage = slicedPages[i + 1];
          let previousPage = slicedPages[i - 1];
          if (nextPage) props.sys.next = nextPage.props;
          if (previousPage) props.sys.previous = previousPage.props;
          return page;
        })

      scopes.push(scope);
      return each.replace(/(?<=match=['"`]).+?(?=["'`])/i, scope.id);
    })
  })

  return scopes;
}


function parseEach({ props }, scopes) {

  let depth = 0;
  while (matchers.each.test(props.sys.content)) {
    if (depth > 99) break;
    depth++;

    props.sys.content = props.sys.content.replace(matchers.each, string => {

      let attrs = getAttributes(string);
      let scope = scopes.find(scope => scope.id == parseInt(attrs.match));

      if (!getAttributes(string).from) {
        warning(filename, '<Each> elements require a `from` attribute whose value is a path to a file. The file is hydrated and appended for every page that matches the regular expression in the `match` attribute.');
        return '';
      }

      let path = getAttributes(string).from.trim();
      let pathPrefix = /^\./.test(path) ? props.sys.href : '';
      let importContent = readLocal(join(src, path, pathPrefix));

      if (/\{\*\s*\*\}/.test(importContent))
        notify(path, `Empty starburns {* *}`);

      if (/\{%\s*%\}/.test(importContent))
        notify(path, `Empty nunjucks {% %}`);

      return scope.pages.map(page => hydrate(importContent, page.props)).join('');
    })
  }
}

module.exports = { parseEach, getScopes };