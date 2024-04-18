declare module "nonce-str/index" {
  export default function (num: string): string;
}

type JSBridgeServerOptionsType = {
  port?: number;
  origin?: string[];
};
