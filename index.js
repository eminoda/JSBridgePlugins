const fs = require("fs");
const path = require("path");

const { start } = require("./server/dist/app.js");

const pluginName = "JSBridgePlugin";
let server = null;

class JSBridgePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
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
