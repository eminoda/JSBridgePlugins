class JsBridge {
  constructor() {
    this._events = [];
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeObject && window.webkit.messageHandlers.nativeObject.postMessage) {
      this._env = "ios";
    } else if (window.androidJS && window.androidJS.nativeMethod) {
      this._env = "android";
    } else if (/harmony/i.test(window.navigator.userAgent)) {
      this._env = "harmony";
    } else {
      this._env = "web";
    }
  }

  // 同步
  async _nativeFunSync(data) {
    console.log("同步方法", data);
    if (this._env === "android") {
      return JSON.parse(window.androidJS.nativeMethod(JSON.stringify(data)));
    } else if (this._env === "ios") {
      return JSON.parse(window.prompt(JSON.stringify(data)));
    } else if (this._env === "harmony") {
      console.log("service---", window[service], data)
      return window[service][data.action](JSON.stringify(data))
    } else {
      return { code: -1, msg: "请在 native 环境运行" };
    }
  }

  // 异步
  async _nativeFun(data) {
    console.log("异步方法", data);
    if (this._env === "android") {
      return window.androidJS.nativeMethod(JSON.stringify(data));
    } else if (this._env === "ios") {
      return window.webkit.messageHandlers.nativeObject.postMessage(data);
    } else if (this._env === "harmony") {
      console.log("service---", window[service], data)
      return window[service][data.action](JSON.stringify(data))
    } else {
      return { code: -1, msg: "请在 native 环境运行" };
    }
  }
  async register(data, fn) {
    data.callbackId = data.callbackId || Date.now();

    this._events.push({
      type: "register",
      callbackId: data.callbackId,
      callbackFn: fn,
    });

    await this._nativeFun(data);
    return data.callbackId;
  }
  unregister(callbackId) {
    for (let i = 0; i < this._events.length; i += 1) {
      const event = this._events[i];
      if (event.callbackId === callbackId) {
        this._events.splice(i, 1);
        break;
      }
    }
  }
  invoke(data = {}) {
    if (!data.callbackId) {
      data.callbackId = Date.now();
    }
    const { callbackId, action, module, params, callback } = data;
    return new Promise(async (resolve, reject) => {
      if (callback) {
        const id = callbackId || Date.now();
        this._events.push({
          callbackId,
          callbackFn: (_data) => {
            if (_data.code === 0) {
              resolve(_data);
            } else {
              resolve({ msg: _data.msg || "sdk 处理异常", code: _data.code });
            }
          },
        });
        this._nativeFun(data);
      } else {
        const _data =await this._nativeFunSync(data);
        if (_data.code === 0) {
          resolve(_data);
        } else {
          // const error = new Error(_data.msg || "sdk 处理异常");
          // error.code = _data.code;
          _data.msg || "sdk 处理异常";
          // reject(error);
          resolve(_data);
        }
      }
    });
  }

  receiveMessage(data) {
    // alert("receiveMessage:" + data);
    console.log("app 回传数据", data);
    const { callbackId, ..._data } = JSON.parse(data);
    for (let i = 0; i < this._events.length; i += 1) {
      const event = this._events[i];
      if (String(event.callbackId) === String(callbackId)) {
        event.callbackFn(_data);
        if (event.type !== "register") {
          this._events.splice(i, 1);
        }
        return;
      }
    }
    throw new Error("JSBridge 数据异常，请重试");
  }
}

window.$jsBridge = new JsBridge();

window.receiveMessage = window.$jsBridge.receiveMessage.bind(window.$jsBridge);
