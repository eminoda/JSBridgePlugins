import { useEffect, useState, useRef } from "react";
import { Socket, io } from "socket.io-client";

export default function useJSBridgeSocket({ receiveData }: { receiveData: (data: ServerMessage) => void }) {
  const SOCKET_STATUS = {
    NO_CONNECTING: 0,
    CONNECTING: 1,
    BREAK: 2,
  };

  const socket = useRef<Socket | null>(null);

  const [socketStatus, setSocketStatus] = useState(0);
  const [socketStatusText, setSocketStatusText] = useState("");
  const [socketStatusTip, setSocketStatusTip] = useState("");

  useEffect(() => {
    socket.current = io("http://192.168.13.115:3300", {
      query: {
        type: "jsbridge-client",
      },
    });
    socket.current.on("connect", () => {
      setSocketStatus(SOCKET_STATUS.CONNECTING);
      setSocketStatusText("服务已连接");
      setSocketStatusTip("ok");
    });
    socket.current.on("disconnect", () => {
      setSocketStatus(SOCKET_STATUS.BREAK);
      setSocketStatusText("服务连接中断");
      setSocketStatusTip("JSBridge Server 异常，请重新启动插件");
    });
    socket.current.on("server-send", async (serverMessage) => {
      receiveData(serverMessage);
    });
    return () => {
      setSocketStatus(SOCKET_STATUS.NO_CONNECTING);
      setSocketStatusText("服务连接中断");
      setSocketStatusText("主动关闭服务连接");
      socket.current?.disconnect();
    };
  }, []);

  return {
    socketStatus,
    socketStatusText,
    socketStatusTip,
    sendData: (serverMessage: ServerMessage) => {
      socket.current?.emit("jsbridge-send", serverMessage);
    },
  };
}
