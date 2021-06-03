const { matchTag } = require("./utils");

const matchers = {
  each: matchTag('Each'),
  import: matchTag('Import')
}

module.exports = matchers;