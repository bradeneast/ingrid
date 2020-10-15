const { dist } = require('../options.js');
const render = require('../render.js');
const makeTree = require('../makeTree.js');
const mime = require('./mimeTypes.js');
const onConnect = require('./serverSocket.js');
const clientSocket = require('./clientSocket');

const fs = require('fs-extra');
const http = require('http');
const WebSocket = require('ws');
const { join, extname, resolve } = require('path');


function startDevServer({ port, hostname }) {

	let server = http.createServer(handleRequest);
	let wss = new WebSocket.Server({ server });

	wss.on('connection', onConnect);
	wss.on('close', () => server.close());
	wss.on('error', err => {
		console.error(err);
		server.close();
	});

	server.listen(port, hostname, () =>
		console.log(`Server running at http://${hostname}:${port}/`)
	);


	function handleRequest(request, response) {

		let currentHref = request.url.toString().split('?')[0];
		let absolutePath = join(resolve(dist), currentHref);
		let type = mime[extname(currentHref).slice(1)];


		/******HELPERS******/

		/**Sets the content type of the HTTP response header */
		let setContentType = type => response.setHeader('Content-Type', type);

		/**Generates a new page tree and finds the page matching the request URL */
		function renderCurrentPage() {
			let tree = makeTree();
			for (let page of tree)
				if (page.props.sys.href == currentHref)
					return render(page, tree).content;
		}

		/**Sends a plain-text 404 error to the client */
		function send404() {
			setContentType('text/plain');
			response.statusCode = 404;
			response.end('Not found');
		}

		/****************/


		// Handle requests with a file extension
		if (type) {
			setContentType(type);
			let stream = fs.createReadStream(absolutePath);
			stream.on('open', () => stream.pipe(response));
			stream.on('error', send404);
		}

		// Handle requests without a file extension
		if (!type) {
			setContentType('text/html');
			let html = renderCurrentPage();
			let matchClosingBodyTag = /(?=<\/body>)/i;

			if (html) {
				// Inject socket script
				if (matchClosingBodyTag.test(html))
					response.end(html.replace(matchClosingBodyTag, clientSocket));
				else
					response.end(html + clientSocket);
			}

			if (!html) send404();
		}
	}
}


module.exports = startDevServer;