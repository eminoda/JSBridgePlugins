// TODO 代理 api
// TODO 客户端 socket
import { Socket, io } from "socket.io-client";
import { nonce } from "nonce-str/index";
let jsBridgeSocketId = "";

type CallbackFnQueueType = {
  seqId: string;
  callbackFn: (data: { seqId: string; [key: string]: any }) => void;
};

const mockQueue: CallbackFnQueueType[] = [];
const checkJsBridgeConnectStatus = () => {
  return new Promise((resolve) => {
    const checkPoll = () => {
      console.log("check JSBridge Server Connection...");
      if (jsBridgeSocketId) {
        resolve(true);
      } else {
        socket.emit("client-list");
        setTimeout(() => {
          checkPoll();
        }, 500);
      }
    };
    checkPoll();
  });
};

const socket: Socket = io("http://192.168.13.115:3300", {
  query: {
    type: "mock-client",
  },
});

socket.on("connect", () => {
  socket.emit("client-list");
});
socket.on("disconnect", () => {
  console.log("disconnect");
});
socket.on("client-list", (list = []) => {
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
      const seqId = "mock_" + nonce(10);
      return new Promise((resolve) => {
        mockQueue.push({
          seqId,
          callbackFn: (respData) => {
            resolve(respData);
          },
        });
        socket.emit("mock-send", { seqId, ...data });
      });
    } catch (error) {}
  },
  receiveMessage: async () => {},
};
