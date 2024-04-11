import url from "url";
import portfinder from "portfinder";
import { ip } from "address";
import defaultGateway from "default-gateway";

export const getAvaiableServerAddress = async (port: number = 3300) => {
  portfinder.setBasePort(port);
  const _port = await portfinder.getPortPromise();
  // { gateway: '192.168.15.1', interface: 'WLAN' }
  const Gateway = defaultGateway.v4.sync();
  const avaiableAddress = url.format({
    protocol: "http",
    hostname: ip(Gateway.interface),
    port,
    pathname: "",
  });
  return { url: avaiableAddress, port: _port };
};
