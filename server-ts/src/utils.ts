import http from "http";
import url from "url";
import { ip } from "address";
import portfinder from "portfinder";
import * as defaultGateway from "default-gateway";
import chalk from "chalk";
import { Server } from "socket.io";

export const getAvaiableServerAddress = async (port: number = 3300) => {
  portfinder.setBasePort(port);
  const _port = await portfinder.getPortPromise();
  // // { gateway: '192.168.15.1', interface: 'WLAN' }
  const gatewayResult = defaultGateway.gateway4sync();
  const avaiableAddress = url.format({
    protocol: "http",
    hostname: ip(gatewayResult.int),
    port,
    pathname: "",
  });
  return { url: avaiableAddress, port: _port };
};

export const createJSBridgeSocketServer = async (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });
  io.disconnectSockets();

  io.on("connection", async (socket) => {});
  return io;
};

export const logger = {
  warning(msg) {
    console.log(chalk.yellow(msg));
  },
  info(...msg) {
    console.log(chalk.blue(...msg));
  },
  debug(msg, origin) {
    if (origin === "mock-client") {
      console.log(chalk.greenBright(msg));
    } else {
      console.log(chalk.cyan(msg));
    }
  },
  error(msg) {
    console.log(chalk.red(msg));
  },
};
