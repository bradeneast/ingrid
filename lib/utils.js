const fs = require('fs-extra');
const marked = require('marked');
const prism = require('prismjs');
const { src } = require('./options.js');
const { join } = require('path');

let slash = string => string.replace(/\\/g, '/');

/**Gets the tag name of the first HTML element in a string */
let getTagName = string => (string.match(/(?<=<).+?(?=[ >])/) || [])[0];


/**Matches the outer HTML of the innermost tag with that name */
let matchTag = tagName => tagName
	? new RegExp(`<${tagName}((.|\n|\r)(?!<${tagName}))+?<\/${tagName}>`, 'g')
	: /<(\w*)\b.*?>((.|\n|\r)(?!<\1))*?<\/\1>/g;


/**Gets the inner HTML of a tag */
function getInner(string) {
	let tagName = getTagName(string);
	let matcher = new RegExp(`(?<=<${tagName}.*?>)((.|\n|\r)(?!<${tagName}))+?(?=<\/${tagName}>)`);
	let results = string.match(matcher) || [];
	return results[0] || '';
}


/**Takes a stringified HTML element and returns a map of its attributes */
function getAttributes(string) {
	let firstLine = string.split(/[\n\r]/)[0];
	let attributeChunks = firstLine.match(/(?<= +).+?=([`'"].+?(?=[`'"])|.+?(?=[ >]))/g);
	let attributes = {};

	if (attributeChunks)
		attributeChunks.map(chunk => {
			let [key, value] = chunk.replace(/\=[`'"]?/, '=').split(/\=/);
			attributes[key] = value == 'undefined' ? undefined : value;
		});

	return attributes;
}

/**Parses the sort attribute from an <Each> element */
function getSortParameter(string = 'sys.href') {
	let reverse = '';
	if (string[0] == '-') {
		reverse = '-';
		string = string.slice(1);
	}
	return reverse + 'props.' + string;
}


/**Gets all basic properties of a stringified HTML element */
function getElementProps(string) {
	return {
		inner: getInner(string),
		attrs: getAttributes(string),
		name: getTagName(string)
	}
}


/**Takes a relative path and converts it to an absolute path in the src folder */
function getAbsolutePath(path, currentDir) {
	path = path.trim();
	return join(
		src,
		path[0] == '/' ? '' : currentDir,
		path
	)
}


/**Reads a local file and parses it as markdown if the extension is '.md' */
function readLocal(path) {

	fs.ensureFileSync(path);
	let isMarkdown = /md/i.test(path.split('.').pop());

	if (isMarkdown)
		marked.setOptions({
			smartLists: true,
			smartypants: true,
			highlight: (code, lang, callback) => {
				let languageDefinition = prism.languages[lang] || prism.languages.markup;
				return prism.highlight(code, languageDefinition, lang)
			},
		});

	return isMarkdown
		? marked(fs.readFileSync(path, 'utf-8'))
		: fs.readFileSync(path, 'utf-8');
}


/**Takes a 'path' of properties and returns the value at the end of the 'path' within a given object */
function accessProp(string = "", obj = {}) {
	let tokens = string.split(".");
	let result = obj[tokens[0]];

	if (tokens.length == 1) return result;
	if (result == undefined) return result;

	for (let i = 1; i < tokens.length; i++) {
		result = result[tokens[i]];
		if (result == undefined) return result;
	}

	return result;
}


/** Sorts an array of objects by comparing the values of a property those objects have in common
 * (For use inside the Array.sort() method)
 * @param {string} property The property whose value will be compared in the sort
*/
function dynamicSort(property) {

	let sortOrder = 1;

	if (property[0] == '-') {
		sortOrder = -1;
		property = property.substr(1);
	}

	return function (a, b) {

		let result = 0;
		let [aVal, bVal] = [a, b].map(obj => {
			let prop = accessProp(property, obj);
			return parseFloat(prop) || new Date(prop).getTime() || prop;
		});

		if (aVal < bVal) result = -1;
		else if (aVal > bVal) result = 1;
		return result * sortOrder;
	}
}


function uniqueID() {
	return Math.round(new Date().getTime() / Math.random())
}


/**Returns a deep iterable of files from the given directory */
function* walkDirSync(dirname, ignorePattern) {
	for (let filename of fs.readdirSync(dirname)) {
		if (ignorePattern.test(filename)) continue;

		let newPath = join(dirname, filename);
		let isDirectory = fs.lstatSync(newPath).isDirectory();

		if (isDirectory) yield* walkDirSync(newPath, ignorePattern);
		if (!isDirectory) yield {
			filename: slash(newPath),
			content: fs.readFileSync(newPath, 'utf-8')
		}
	}
}


module.exports = {
	getTagName,
	matchTag,
	getAbsolutePath,
	getElementProps,
	getSortParameter,
	getInner,
	getAttributes,
	accessProp,
	readLocal,
	dynamicSort,
	walkDirSync,
	uniqueID,
	slash,
}