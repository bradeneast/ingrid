const {
	matchTag,
	readLocal,
	getAbsolutePath,
	getElementProps
} = require('./utils.js');
const { warning } = require('./loggers.js');
const { hydrate } = require('./hydrators.js');


/**Parses a stringified Import HTML element */
function parseImport(string, pageProps) {

	let { attrs, inner } = getElementProps(string);
	let { href } = pageProps.sys;

	if (!attrs.from) {
		warning(href, '<Import> elements require a `from` attribute whose value is a path to the file being imported in its place.');
		return inner;
	}

	let location = href;
	let importElementChildren = inner.match(matchTag());
	let importContent = readLocal(getAbsolutePath(attrs.from, location));
	let importProps = {};
	let setProps = (name, value) => {
		importProps[name] = value;
		if (pageProps[name] == undefined)
			pageProps[name] = value;
	}

	if (/\{\*\s*\*\}/.test(importContent)) {
		notify(href, `Empty starburns {* *}`);
	}

	if (/\{%\s*%\}/.test(importContent)) {
		notify(href, `Empty nunjucks {% %}`);
	}

	for (let elem of importElementChildren || []) {
		let { name, attrs, inner } = getElementProps(elem);
		attrs && attrs.from
			? setProps(name, readLocal(getAbsolutePath(attrs.from, location)))
			: setProps(name, inner.trim());
	}

	return hydrate(importContent, importProps, false);
}


module.exports = parseImport;