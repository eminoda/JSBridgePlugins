import url from "url";
import portfinder from "portfinder";
import { ip } from "address";
import { gateway4sync } from "default-gateway";
import chalk from "chalk";

export const getAvaiableServerAddress = async (port: number = 3300) => {
  portfinder.setBasePort(port);
  const _port = await portfinder.getPortPromise();
  // { gateway: '192.168.15.1', interface: 'WLAN' }
  const gatewayResult = gateway4sync();
  const avaiableAddress = url.format({
    protocol: "http",
    hostname: ip(gatewayResult.int),
    port,
    pathname: "",
  });
  return { url: avaiableAddress, port: _port };
};

export const logger = {
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
