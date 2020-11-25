const {
	matchTag,
	getAttributes,
	getInner,
	accessProp,
	readLocal,
	getAbsolutePath,
	getElementProps
} = require('./utils.js');
const { global } = require('./options.js');
const { warning } = require('./logger.js');
const safeEval = require('safe-eval');


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

	return fillSlots(importContent, importProps);
}


/**Fills slots in a import source file */
function fillSlots(string = '', props = {}) {
	return string.replace(
		matchTag('Slot'),
		slot => props[getAttributes(slot).name] || getInner(slot)
	);
}


/**Interpolates variables where it finds nunjucks and starburns */
function addGarnish(string = '', props = {}) {
	return string.replace(
		/\{([*%])(.|\n|\r)+?\1\}/g,
		garnish => {
			let isNunjucks = garnish.charAt(1) == '%';
			let tokens = garnish.slice(2, -2).trim();

			try {
				return isNunjucks
					? safeEval(tokens, props)
					: accessProp(tokens, props) || accessProp(tokens, global);
			} catch (err) {
				console.error(err);
				return '';
			}
		}
	)
}


/**Fills slots and adds garnish */
function hydrate(string = '', props = {}) {
	return addGarnish(
		fillSlots(string, props),
		props
	);
}


module.exports = {
	parseImport,
	fillSlots,
	addGarnish,
	hydrate,
}