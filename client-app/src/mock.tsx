// TODO 代理 api
// TODO 客户端 socket
import { Socket, io } from "socket.io-client";
const socket = io("http://192.168.13.115:3300", {
  query: {
    type: "mock-client",
  },
});

socket.on("connect", () => {
  console.log("connect");
});
socket.on("disconnect", () => {
  console.log("disconnect");
});
