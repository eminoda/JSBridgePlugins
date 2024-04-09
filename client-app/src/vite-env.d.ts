/// <reference types="vite/client" />

declare interface Window {
  $jsBridge: {
    invoke: Function;
    receiveMessage: Function;
  };
}

type ServerMessage = {
  seqId: string;
  data: { [key: string]: any };
};
