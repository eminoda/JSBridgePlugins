# jsbridge-plugins

A webpack plugin to proxy jsBridge request on JSBridge Server, then you can develop on pc browser without real phones.

![](./arch.jpg)

## Usage

```js
// vue.config.js
const JSBridgePlugin = require("jsbridge-plugins");

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new JSBridgePlugin({
        port: 3300,
        origin: ["http://192.168.13.115:8080"],
      }),
    ],
  },
});
```

## Attention 😥

android and ios provide following js api in this plugins:

```txt
window.androidJS.nativeMethod // android

window.webkit.messageHandlers.nativeObject.postMessage // ios
```

if you need support other api, may be next version will be support.
