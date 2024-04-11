const url = require("url");
const path = require("path");
const chalk = require("chalk");
const address = require("address");
const portfinder = require("portfinder");
const express = require("express");
const SocketIO = require("socket.io");
const defaultGateway = require("default-gateway");
const noncestr = require("nonce-str/index");
const { createProxyMiddleware } = require("http-proxy-middleware");

// const util = require("./util");

let server = null;
let io = null;
const socketQueue = [];
const callbackFnQueue = [];
const app = express();

const logger = {
  warning(msg) {
    console.log(chalk.yellow(msg));
  },
  info(msg) {
    console.log(chalk.blue(msg));
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

const updateSocketQueue = (socket, isAdd) => {
  const index = socketQueue.findIndex((item) => item.id === socket.id);
  if (isAdd && index === -1) {
    socketQueue.push(socket);
  } else if (!isAdd && index !== -1) {
    socketQueue.splice(index, 1);
  }
};

// 加载页面
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html", "js", "css"],
  })
);

app.use(express.json());

// jsbridge 代理
app.post("/jsbridgeProxy", async (req, res, next) => {
  try {
    // util.setServerTimeout(0)(req, res, next);
    if (!io) {
      throw new Error("JSBridge Server 连接异常，请重启服务");
    }

    const seqId = noncestr(6);
    const { data, options = {} } = req.body;
    const { module, action, params, callback, callbackId } = data;

    const sockets = await io.allSockets();
    // TODO 指定 socket
    console.log(sockets.size, socketQueue.length);
    const results = await Promise.all(
      Array.from(sockets)
        .map((socketId) => {
          const socket = socketQueue.find((item) => item.id === socketId);
          return socket;
        })
        .filter((socket) => socket)
        .map((socket) => {
          return new Promise((resolve, reject) => {
            callbackFnQueue.push({
              type: options.type,
              seqId,
              callbackFn: (err, data) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              },
            });
            logger.debug(`[${socket.id}_${seqId}][jsbridge-client] --> ${JSON.stringify(data)}`);
            socket.emit("server-send", { seqId, data: { module, action, params, callback, callbackId: callbackId || seqId, type: options.type } });
          });
        })
    );
    return res.json(results[0]);
  } catch (error) {
    error.code = error.code || -1;
    next(error);
  }
});

const createSocketServer = (httpServer) => {
  io = new SocketIO.Server(httpServer, {
    cors: true,
  });
  io.disconnectSockets();

  io.on("connection", async (socket) => {
    const address = socket.handshake.address;
    const socketType = socket.handshake.query.type;

    logger.info(`[${socket.id}][${socketType}] 已连接：${address}`);
    socketQueue.push(socket);
    updateSocketQueue(socket, true);

    socket.on("disconnect", (reason) => {
      logger.warning(`[${socket.id}][${socketType}] 断开连接：${address}，${reason}`);
      updateSocketQueue(socket, false);
    });
    socket.on("jsbridge-send", ({ seqId, data }) => {
      logger.debug(`[${socket.id}_${seqId}][${socketType}] <-- ${JSON.stringify(data)}`);
      const mockSocketId = callbackFnQueue.find((item) => item.seqId === seqId)?.socketId;
      const MockSocket = socketQueue.find((item) => item.id === mockSocketId);
      if (MockSocket) {
        MockSocket.emit("mock-send", { seqId, data });
      }
      // const match = callbackFnQueue.find((item) => item.seqId === seqId);
      // if (match) {
      //   match.callbackFn(null, data);
      //   if (match.type) {
      //     const removeIndex = callbackFnQueue.findIndex((item) => item.seqId === seqId);
      //     callbackFnQueue.splice(removeIndex, 1);
      //   }
      // } else {
      //   logger.error(`[${socket.id}_${seqId}][${socketType}] 回调函数不存在`);
      // }
    });
    socket.on("mock-send", ({ seqId, socketId, data }) => {
      logger.debug(`[${socket.id}_${seqId} to ${socketId}][${socketType}] --> ${JSON.stringify(data)}`, socketType);
      const JSBridgeSocket = socketQueue.find((item) => item.id === socketId);
      if (JSBridgeSocket) {
        logger.debug(`[${JSBridgeSocket.id}_${seqId}][${JSBridgeSocket.handshake.query.type}] --> ${JSON.stringify(data)}`);
        callbackFnQueue.push({ seqId, socketId: socket.id });
        JSBridgeSocket.emit("server-send", { seqId, data });
      }
    });
    // 查询当前 JSBridge Server 列表
    socket.on("socket-list", (type) => {
      const activeJSBridgeList = socketQueue.filter((item) => item.handshake.query.type === type).map((socket) => socket.id);
      logger.debug(`[${socket.id}] 当前 JSBridge 列表：${activeJSBridgeList}`);
      socket.emit("socket-list", activeJSBridgeList);
    });
  });
  return io;
};

app.use((error, req, res, next) => {
  res.json({ code: -1, msg: error.message });
});
module.exports = {
  start(options = {}) {
    return new Promise((resolve, reject) => {
      portfinder.setBasePort(options.port || 3300);
      portfinder
        .getPortPromise()
        .then((port) => {
          server = app.listen(port, () => {
            const result = defaultGateway.v4.sync();
            const agentUrl = url.format({
              protocol: "http",
              hostname: address.ip(result && result.interface),
              port,
              pathname: "",
            });
            console.log("JSBridge Server running at:", chalk.cyan(agentUrl));
            io = createSocketServer(server);
            resolve(server);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
