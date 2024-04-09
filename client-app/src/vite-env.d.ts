/// <reference types="vite/client" />

declare interface Window {
  $jsBridge: {
    invoke: Function;
    receiveMessage: Function;
  };
}

type ServerMessage = {
  time?: string;
  seqId: string;
  data: { [key: string]: any };
};
