const path = require('path');
const { cwd } = require('process');
const fs = require('fs-extra');

let cfgName = 'ingrid.config.js';
let pkgName = 'ingrid-ssg';
let userConfig = path.join(cwd(), cfgName);
let defaultConfig = path.join(cwd(), 'node_modules', pkgName, cfgName);

// Look for a user config file
if (!fs.existsSync(userConfig)) {
	// Create the default file
	fs.copyFileSync(defaultConfig, userConfig);
	console.info('ingrid.config.js created');
	console.info('using default options');
}

// const defaults = require(defaultConfig);
const { src, dist, ignorePattern, global } = require(userConfig);

// Set and export default options
module.exports = {
	src: src || defaults.src,
	dist: dist || defaults.dist,
	ignorePattern: ignorePattern || defaults.ignorePattern,
	global: global || defaults.global
}