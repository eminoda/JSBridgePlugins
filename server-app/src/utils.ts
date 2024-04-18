import chalk from "chalk";
// import { red, volcano, gold, yellow, lime, green, cyan, blue, geekblue, purple, magenta, grey } from "@ant-design/colors";

export const logger = {
  warning(...msg) {
    console.log(chalk.yellow(...msg));
  },
  info(...msg) {
    console.log(chalk.blue(...msg));
  },
  debug(...msg) {
    console.log(chalk.cyan(...msg));
  },
  error(...msg) {
    console.log(chalk.red(...msg));
  },
};
