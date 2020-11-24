module.exports = `
body {
  font-family: sans-serif;
  max-width: 48em;
  padding: 6vmin;
}

a {
  margin-right: 2em;
  margin-bottom: 2em;
  display: inline-block;
  text-decoration: none;
  background-color: #ccc;
  color: #222;
  padding: 0.63em 1em;
  padding-left: 2em;
  background-size: 0.9em;
  background-repeat: no-repeat;
  background-position: 0.63em center;
  border-radius: 5px;
}

a:hover,
a:focus {
  background-color: #ddd;
  color: #000;
}

[data-isDirectory="false"] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M80,489.24c-23.29,0-42.24-17.52-42.24-39.05V61.81c0-21.53,19-39,42.24-39H284.1a44.29,44.29,0,0,1,30,11.61L398,112.7a37.56,37.56,0,0,1,12.27,27.44V450.19c0,21.53-18.95,39.05-42.24,39.05ZM74.24,456H373.76V175.55H264c-10.06,0-18.24-7.47-18.24-16.64V56.05H74.24Zm208-313.69h96.47L282.24,52.2ZM140,358.54c-3.38,0-6.24-2.5-6.24-5.45V327c0-2.95,2.86-5.44,6.24-5.44H308c3.38,0,6.24,2.49,6.24,5.44v26.14c0,3-2.86,5.45-6.24,5.45Zm0-78.42c-3.38,0-6.24-2.5-6.24-5.45V248.53c0-2.95,2.86-5.44,6.24-5.44H308c3.38,0,6.24,2.49,6.24,5.44v26.14c0,2.95-2.86,5.45-6.24,5.45Z'/%3E%3C/svg%3E");
}

[data-isDirectory="true"] {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 542 442'%3E%3Cpath d='M496.76,199H451.68V131c0-26.5-20.23-48-45.17-48H256L195.73,19H45.17C20.23,19,0,40.49,0,67V375c0,26.5,20.23,48,45.17,48h376.4c15.53,0,30-8.5,38.3-22.6l75.18-128C553.87,240.51,532.23,199,496.76,199ZM45.17,73a5.85,5.85,0,0,1,5.64-6H177l60.23,64H400.87a5.85,5.85,0,0,1,5.64,6v62H143c-15.81,0-30.49,8.8-38.67,23.2L45.17,326.41Zm376.4,302H67.75L140.4,247H496.85Z'/%3E%3C/svg%3E");
}
`