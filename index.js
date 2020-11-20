#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const { dist, src, ignorePattern } = require('./lib/options.js');
const startDevServer = require('./lib/dev/server.js');
const makeTree = require('./lib/makeTree.js');
const render = require('./lib/render.js');



console.time('Built in');
console.log('\nStarting...\n');

fs.ensureDirSync(dist);
fs.ensureDirSync(src);

let dev = /-dev/i.test(process.argv.toString());


if (dev) {
	startDevServer({
		port: 3000,
		hostname: '127.0.0.1'
	});
}


if (!dev) {
	// Clear the dist directory
	for (let filename of fs.readdirSync(dist))
		if (!ignorePattern.test(filename))
			fs.removeSync(path.join(dist, filename));

	// Render tree
	let tree = makeTree();

	tree.map(page => {
		let { destination, content } = render(page, tree);
		fs.ensureFileSync(destination);
		fs.writeFile(destination, content);
	})
}



console.timeEnd('Built in');
console.log('\n\n');