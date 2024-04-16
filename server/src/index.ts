import { start } from "./app.js";

let server = null;
server && server.close();

start().then((_server) => {
  server = _server;
});
