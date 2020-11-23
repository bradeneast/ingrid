class Ingrid {

	build() {

		const fs = require('fs-extra');
		const path = require('path');
		const { dist, src, ignorePattern } = require('./lib/options.js');
		const makeTree = require('./lib/makeTree.js');
		const render = require('./lib/render.js');

		console.time('Built in');
		console.log('\nStarting...\n');
		fs.ensureDirSync(dist);
		fs.ensureDirSync(src);

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

		console.timeEnd('Built in');
		console.log('\n\n');
	}

}


module.exports = Ingrid;