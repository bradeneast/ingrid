#!/usr/bin/env node

const { dist, ignorePattern } = require('./lib/options.js');
const makeTree = require('./lib/makeTree.js');
const render = require('./lib/render.js');
const runDev = require('./lib/runDev.js');
const fs = require('fs-extra');
const path = require('path');


console.time('Built in');


let dev = /-dev/i.test(process.argv.toString());


if (dev) {
	runDev({
		port: 3000,
		hostname: '127.0.0.1'
	});
}


if (!dev) {
	// Clear the dist directory
	fs.ensureDirSync(dist);

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