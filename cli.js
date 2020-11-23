#!/usr/bin/env node

const buildFromSrc = require("./ingrid-ssg");
const startDevServer = require('./lib/dev/server.js');

let dev = /-dev/i.test(process.argv.toString());

if (dev) {
  startDevServer({
    port: 3000,
    hostname: '127.0.0.1'
  });
}
if (!dev) {
  buildFromSrc();
}