const fs = require("fs");
const path = require("path");
const InjectPlugin = require("webpack-inject-plugin").default;
const { start } = require("./server-app/dist/index.js");
const WebpackDevServer = require("webpack-dev-server");

const pluginName = "JSBridgePlugin";
let server = null;

class JSBridgePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    new InjectPlugin(function () {
      return `require('./dist-mock/jsbridge-mock.umd.js')`;
    }).apply(compiler);

    // start JSBridge Server after compiler done
    compiler.hooks.done.tapAsync(pluginName, async (stats, callback) => {
      try {
        server && server.close();
        server = await start(this.options);
        callback();
      } catch (error) {
        callback(error);
      }
    });
  }
}

module.exports = JSBridgePlugin;
