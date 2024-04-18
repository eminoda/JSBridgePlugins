const path = require("path");
const express = require("express");

import { getAvaiableServerAddress, createJSBridgeSocketServer } from "./server";
import { logger } from "./utils";

const app = express();

app.use(
  express.static(path.join(__dirname, "../public"), {
    extensions: ["html", "js", "css"],
  })
);

export const start = async function (options: JSBridgeServerOptionsType = {}) {
  const { url, port } = await getAvaiableServerAddress(options.port);

  const server = app.listen(port, async () => {
    const jsBridgeSocket = createJSBridgeSocketServer(server);
    logger.info("JSBridge Server running at:", url);
  });
};
