import http from "http";
import express from "express";

import * as SocketServer from "socket.io";
import noncestr from "nonce-str/index";

import { getAvaiableServerAddress, logger } from "./utils.js";

const app = express();

let server: http.Server | null = null;
let io = null;

console.log(SocketServer);

export const start = async function (options: JSBridgeServerOptionsType = {}) {
  await getAvaiableServerAddress(options.port);
  const { url, port } = await getAvaiableServerAddress(options.port);
  server = app.listen(port, () => {
    logger.debug("JSBridge Server running at:", url);
  });
};
