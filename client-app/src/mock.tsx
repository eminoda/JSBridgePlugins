// TODO 代理 api
// TODO 客户端 socket
import { Socket, io } from "socket.io-client";
import nonce from "nonce-str/index";
let jsBridgeSocketId = "";

type CallbackFnQueueType = {
  seqId: string;
  callbackFn: (data: { seqId: string; [key: string]: any }) => void;
};

const mockQueue: CallbackFnQueueType[] = [];

const checkJsBridgeConnectStatus = () => {
  let time = 1;
  return new Promise((resolve) => {
    const checkPoll = () => {
      console.log("check JSBridge Server Connection...");
      if (jsBridgeSocketId) {
        resolve(true);
      } else {
        if (time * 2 > 30) {
          throw new Error("链接超时");
        }
        time++;
        socket.emit("socket-list", "jsbridge-client");
        setTimeout(() => {
          checkPoll();
        }, 500);
      }
    };
    checkPoll();
  });
};

const socket: Socket = io(location.origin, {
  query: {
    type: "mock-client",
  },
});

socket.on("connect", () => {
  socket.emit("socket-list", "jsbridge-client");
});
socket.on("disconnect", () => {
  console.log("disconnect");
});
socket.on("socket-list", (list = []) => {
  if (list.length === 1) {
    jsBridgeSocketId = list[0];
  }
});

socket.on("mock-send", ({ seqId, ...data }) => {
  const matched = mockQueue.find((item) => item.seqId === seqId);
  if (matched) {
    matched.callbackFn(data);
  }
});
// 覆写 native 方法
window.$jsBridge = {
  invoke: async (data: { [key: string]: any }) => {
    try {
      // TODO 多个 JSBridgeList 处理，目前只取前第一个
      await checkJsBridgeConnectStatus();
      // 发送数据给 JSBridgeServer
      if (!socket.connected) {
        throw new Error("服务已断开，请检查 业务端、JSBridge Server 网络情况");
      }
      const seqId = nonce(10);
      return new Promise((resolve) => {
        mockQueue.push({
          seqId,
          callbackFn: (respData) => {
            resolve(respData);
          },
        });
        socket.emit("mock-send", { seqId, jsBridgeSocketId: jsBridgeSocketId, data });
      });
    } catch (error: any) {
      console.log(error);
      throw new Error("[$jsBridge.invoke error] " + error.message);
    }
  },
  receiveMessage: async () => {},
};

// 测试
setTimeout(() => {
  window.$jsBridge
    .invoke({
      module: "tool",
      action: "deviceInfo",
      params: {
        user: "eminoda",
        age: 20,
      },
    })
    .then((data: any) => {
      console.log(data);
    })
    .catch((err: any) => {
      console.log(err);
    });
}, 1 * 1000);
