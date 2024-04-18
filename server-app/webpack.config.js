const path = require("path");
const { library } = require("webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  mode: "production",
  entry: {
    index: "./src/app.ts",
  }, // 入口文件路径
  output: {
    path: path.resolve(__dirname, "dist"), // 输出目录
    filename: "[name].js", // 输出文件名
    libraryTarget: "commonjs",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".mts", ".js"],
  },
  externals: [
    nodeExternals({
      allowlist: ["chalk", "default-gateway", "execa", "strip-final-newline", "npm-run-path", "onetime", "mimic-fn", "human-signals", "is-stream"],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        // exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: false,
          },
        },
      },
    ],
  },
};
