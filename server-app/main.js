const { start } = require("./dist/index.js");

let server = null;
server && server.close();

start({ origin: "http://localhost:5173" }).then((_server) => {
  server = _server;
});
