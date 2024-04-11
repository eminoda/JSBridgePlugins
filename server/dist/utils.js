"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvaiableServerAddress = void 0;
const url_1 = __importDefault(require("url"));
const portfinder_1 = __importDefault(require("portfinder"));
const address_1 = require("address");
const default_gateway_1 = __importDefault(require("default-gateway"));
const getAvaiableServerAddress = async (port = 3300) => {
    portfinder_1.default.setBasePort(port);
    const _port = await portfinder_1.default.getPortPromise();
    // { gateway: '192.168.15.1', interface: 'WLAN' }
    const Gateway = default_gateway_1.default.v4.sync();
    const avaiableAddress = url_1.default.format({
        protocol: "http",
        hostname: (0, address_1.ip)(Gateway.interface),
        port,
        pathname: "",
    });
    return { url: avaiableAddress, port: _port };
};
exports.getAvaiableServerAddress = getAvaiableServerAddress;
