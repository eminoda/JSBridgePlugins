import { start } from "./app";

let server = null;
server && server.close();

start().then((_server) => {
  server = _server;
});
