const { start } = require("./server/app");
let server = null;
server && server.close();
start().then((_server) => {
  server = _server;
});
