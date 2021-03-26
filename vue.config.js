const path = require("path");

module.exports = {
  chainWebpack: config => {
    config
      .plugin("html")
      .tap(args => {
        args[0].title = "Rust Hook Browser";
        return args;
      });
  },
  productionSourceMap: false,
  outputDir: path.resolve(__dirname, "../files/hooks")
};
