const { dist } = require('../options.js');
const {
	setContentType,
	send404,
	renderPage
} = require('./serverUtils');
const mime = require('./mimeTypes.js');
const onConnect = require('./serverSocket.js');
const clientSocket = require('./clientSocket');
const folderStructureStyles = require('./folderStructureStyles');

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

		let currentHref = request.url.toString().split('?')[0].replace(/(?<!^)\/$/, '');
		let absolutePath = join(resolve(dist), currentHref);
		let type = mime[extname(currentHref).slice(1)];

		// Handle requests with a file extension
		if (type) {
			setContentType(response, type);
			let stream = fs.createReadStream(absolutePath);
			stream.on('open', () => stream.pipe(response));
			stream.on('error', () => send404(response));
		}

		// Handle requests without a file extension
		if (!type) {
			setContentType(response, 'text/html');
			let html = renderPage(currentHref);
			let matchClosingBodyTag = /(?=<\/body>)/i;

			if (html) {
				// Inject socket script
				if (matchClosingBodyTag.test(html))
					response.end(html.replace(matchClosingBodyTag, clientSocket));
				else
					response.end(html + clientSocket);
			}

			if (!html) {

				try {

					let items = fs.readdirSync(absolutePath).map(item => {
						return {
							name: item,
							href: join(currentHref, item),
							isDirectory: fs.lstatSync(join(absolutePath, item)).isDirectory()
						}
					})

					response.end(
						`<style>${folderStructureStyles}</style>
						${items.map(item =>
							`<a href="${item.href}" data-isDirectory="${item.isDirectory}">
							${item.name}
						</a>`).join('')
						}`
					);
				}
				catch (err) {
					console.log(err);
					send404(response);
				}

			}
		}
	}
}


module.exports = startDevServer;