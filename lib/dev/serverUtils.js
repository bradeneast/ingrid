const render = require('../render.js');
const makeTree = require('../makeTree.js');

/**Sets the content type of the HTTP response header */
let setContentType = (response, type) => response.setHeader('Content-Type', type);

/**Generates a new page tree and finds the page matching the request URL */
function renderPage(href) {
  let tree = makeTree();
  for (let page of tree)
    if (page.props.sys.href == href)
      return render(page, tree).content;
}

/**Sends a plain-text 404 error to the client */
function send404(response) {
  setContentType(response, 'text/plain');
  response.statusCode = 404;
  response.end('Not found');
}

module.exports = {
  setContentType,
  send404,
  renderPage
}