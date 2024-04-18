import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/mock.tsx",
      name: "JSBridgeMock", // 指定库的名称
      fileName: (format) => `jsbridge-mock.${format}.js`, // 指定输出文件名格式
    },
    outDir: "../dist-mock",
  },
});
