import http from "http";
import chalk from "chalk";
import express from "express";

// import SocketIO from "socket.io";
import noncestr from "nonce-str/index";
// import { createProxyMiddleware } from "http-proxy-middleware";

import { getAvaiableServerAddress } from "./utils";

const app = express();

let server: http.Server | null = null;

export const start = async function (options: JSBridgeServerOptionsType = {}) {
  const { url, port } = await getAvaiableServerAddress(options.port);
  server = app.listen(port, () => {
    console.log("JSBridge Server running at:", chalk.cyan(url));
  });
};
