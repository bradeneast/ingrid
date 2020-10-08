function clientSocket() {

	function refreshCSS() {
		var sheets = [].slice.call(document.getElementsByTagName("link"));
		var head = document.getElementsByTagName("head")[0];

		for (var i = 0; i < sheets.length; ++i) {
			var elem = sheets[i];
			var parent = elem.parentElement || head;
			parent.removeChild(elem);
			var rel = elem.rel;

			if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
				var url = elem.href.replace(/(&|\\?)_cacheOverride=\\d+/, '');
				elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
			}

			parent.appendChild(elem);
		}
	}

	var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
	var address = protocol + window.location.host + window.location.pathname + '/ws';
	var socket = new WebSocket(address);

	socket.onmessage = function (msg) {
		switch (msg.data) {
			case 'Reload': {
				socket.send('Successful reload');
				window.location.reload();
			}
			case 'Refresh CSS': {
				socket.send('CSS refreshed');
				refreshCSS();
			}
			default: console.log(msg.data);
		}
	}
}


module.exports = `
<script type="text/javascript">
	// <![CDATA[  <-- For SVG support
		if ('WebSocket' in window) { (${clientSocket.toString()})() }
		else { console.error('This browser does not support web sockets for live-reloading.') }
	// ]]>
</script>`;