import http from "http";
import url from "url";
import { ip } from "address";
import portfinder from "portfinder";
import * as defaultGateway from "default-gateway";
import { Server, Socket } from "socket.io";
import { logger } from "./utils";

export const getAvaiableServerAddress = async (port: number = 3300) => {
  portfinder.setBasePort(port);
  const _port = await portfinder.getPortPromise();
  // // { gateway: '192.168.15.1', interface: 'WLAN' }
  const gatewayResult = defaultGateway.gateway4sync();
  const avaiableAddress = url.format({
    protocol: "http",
    hostname: ip(gatewayResult.int),
    port: _port,
    pathname: "",
  });
  return { url: avaiableAddress, port: _port };
};

export const createJSBridgeSocketServer = async (server: http.Server, origin: string[]) => {
  const socketQueue = [];
  const callbackFnQueue = [];

  const refreshSocketQueue = (socket: Socket) => {
    const index = socketQueue.findIndex((item) => item.id === socket.id);
    if (index === -1) {
      socketQueue.push(socket);
    } else {
      socketQueue.splice(index, 1);
    }
  };

  const io = new Server(server, {
    cors: {
      origin,
    },
  });
  io.disconnectSockets();

  io.on("connection", async (socket) => {
    const address = socket.handshake.address;
    const socketType = socket.handshake.query.type; // jsbridge-client

    logger.info(`[${socket.id}][${socketType}] 已连接：${address}`);

    refreshSocketQueue(socket);

    socket.on("disconnect", (reason) => {
      logger.warning(`[${socket.id}][${socketType}] 断开连接：${address}，${reason}`);
      refreshSocketQueue(socket);
    });

    socket.on("socket-list", (type) => {
      const socketList = socketQueue.filter((item) => item.handshake.query.type === type).map((socket) => socket.id);
      logger.debug(`[${socket.id}][${type}] 列表：${socketList}`);
      socket.emit("socket-list", socketList);
    });

    socket.on("mock-send", ({ seqId, jsBridgeSocketId, data }) => {
      const JSBridgeSocket = socketQueue.find((item) => item.id === jsBridgeSocketId);
      if (JSBridgeSocket) {
        logger.debug(`[${seqId}][${socket.id} to ${jsBridgeSocketId}] -->`, JSON.stringify(data));
        callbackFnQueue.push({ seqId, socketId: socket.id });
        JSBridgeSocket.emit("server-send", { seqId, data });
        return;
      }
      logger.error(`[${jsBridgeSocketId}] JSBridgeSocket 不存在`);
    });

    socket.on("jsbridge-send", ({ seqId, data }) => {
      const mockSocketId = callbackFnQueue.find((item) => item.seqId === seqId)?.socketId;
      if (mockSocketId) {
        const MockSocket = socketQueue.find((item) => item.id === mockSocketId);
        if (MockSocket) {
          logger.debug(`[${seqId}][${socket.id} to ${mockSocketId}] <--`, JSON.stringify(data));
          MockSocket.emit("mock-send", { seqId, data });
          return;
        }
      }
      logger.error(`[${mockSocketId}] MockSocket 不存在`);
    });
  });
  return io;
};
