async function warning(filename, message) {
  console.info('\x1b[35m%s\x1b[0m', `Warning at ${filename}:`);
  console.warn(message + '\n');
}

async function notify(filename, message) {
  console.info('\x1b[34m%s\x1b[0m', `Note at ${filename}:`);
  console.log(message + '\n');
}

module.exports = {
  warning,
  notify,
}