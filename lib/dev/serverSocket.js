const { src, dist } = require('../options');
const colors = require('colors');
const { log, error } = require('console');
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
			log(confirmation.blue);
			socket.send(message);
		}, delay);
	}


	function handleError(err) {
		error(err);
		srcWatcher.close();
		distWatcher.close();
	}


	socket.on('message', msg => log(msg.green));
	socket.on('close', handleError);
	socket.on('error', handleError);

	distWatcher.on('change', reactToChanges);
	srcWatcher.on('change', reactToChanges);
	srcWatcher.on('error', handleError);
	distWatcher.on('error', handleError);

	socket.send('Web socket connected: Ready for changes');
}


module.exports = onConnect;