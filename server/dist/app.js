"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const chalk_1 = __importDefault(require("chalk"));
const express_1 = __importDefault(require("express"));
// import { createProxyMiddleware } from "http-proxy-middleware";
const utils_1 = require("./utils");
const app = (0, express_1.default)();
let server = null;
const start = async function (options = {}) {
    const { url, port } = await (0, utils_1.getAvaiableServerAddress)(options.port);
    server = app.listen(port, () => {
        console.log("JSBridge Server running at:", chalk_1.default.cyan(url));
    });
};
exports.start = start;
