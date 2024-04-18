const { start } = require("./dist/index.js");

let server = null;
server && server.close();

start().then((_server) => {
  server = _server;
});
