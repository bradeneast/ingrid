const { src, dist } = require('../options');
const { log } = require('console');
const { watch } = require('fs-extra');
const { extname } = require('path');


function onConnect(socket) {

	let waiter;
	let delay = 250;
	let watcherOptions = { recursive: true };
	let srcWatcher = watch(src, watcherOptions);
	let distWatcher = watch(dist, watcherOptions);


	function reactToChanges(eventType, filename) {

		clearTimeout(waiter);
		let confirmation = `\nChange detected... ${filename || ''}`;
		let message = extname(filename) == '.css' ? 'Refresh CSS' : 'Reload';

		waiter = setTimeout(() => {
			log(confirmation);
			socket.send(message);
		}, delay);
	}


	function closeWatchers() {
		srcWatcher.close();
		distWatcher.close();
	}


	socket.on('message', msg => log(msg));
	socket.on('close', closeWatchers);
	socket.on('error', closeWatchers);

	distWatcher.on('change', reactToChanges);
	srcWatcher.on('change', reactToChanges);
	srcWatcher.on('error', closeWatchers);
	distWatcher.on('error', closeWatchers);

	socket.send('Web socket connected: Ready for changes');
}


module.exports = onConnect;