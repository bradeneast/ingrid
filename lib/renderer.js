const { src, dist } = require('./options.js');
const { addGarnish } = require('./hydrators.js');
const { basename } = require('path');

/**
 * Renders the output HTML of a page to it's public destination
 * @param {any} param0 a page object with a filename and props
 * @param {any[]} pageMap the complete array of page objects
 */
function render({ filename, props }) {
  return {
    destination: filename.replace(basename(src), basename(dist)),
    content: addGarnish(props.sys.content, props).trim(),
  }
}

module.exports = render;