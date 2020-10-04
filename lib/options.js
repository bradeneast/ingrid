const path = require('path');
const { cwd } = require('process');
const fs = require('fs-extra');

let userConfig = path.join(cwd(), 'ingrid.config.js');
let defaultConfig = path.join('../ingrid.config.js');

if (!fs.existsSync(userConfig)) {
	fs.copyFileSync(defaultConfig, userConfig);
	console.info('ingrid.config.js created');
	console.info('using default options');
}

const config = require(userConfig);

// Set default options
module.exports = {
	src: config?.src || defaults.src,
	dist: config?.dist || defaults.dist,
	ignorePattern: config?.ignorePattern || defaults.ignorePattern,
	global: config?.global || defaults.global
}