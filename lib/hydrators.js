const {
  matchTag,
  getAttributes,
  getInner,
  accessProp,
} = require('./utils.js');
const { global } = require('./options.js');
const safeEval = require('safe-eval');


/**Fills slots in a import source file */
function fillSlots(string = '', props = {}) {
  return string.replace(
    matchTag('Slot'),
    slot => props[getAttributes(slot).name] || getInner(slot)
  );
}


/**Interpolates variables where it finds nunjucks and starburns */
function addGarnish(string = '', props = {}, forceUndefined = true) {
  return string.replace(
    /\{([*%])(.|\n|\r)+?\1\}/g,
    garnish => {
      let isNunjucks = garnish.charAt(1) == '%';
      let isStarburns = garnish.charAt(1) == '*';
      let tokens = garnish.slice(2, -2).trim();

      try {
        let result;

        if (isNunjucks)
          result = safeEval(tokens, props)
        if (isStarburns)
          result = accessProp(tokens, props) || accessProp(tokens, global);

        if (forceUndefined)
          return result;
        if (result == undefined && !forceUndefined)
          return garnish;
        else return result;

      } catch (err) {
        console.error(err);
        return '';
      }
    }
  )
}


/**Fills slots and adds garnish */
function hydrate(string = '', props = {}, forceUndefined = true) {
  let filled = fillSlots(string, props);
  let garnished = addGarnish(filled, props, forceUndefined);
  return garnished;
}

module.exports = {
  hydrate,
  fillSlots,
  addGarnish
}