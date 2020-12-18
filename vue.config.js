const analyzer = require('webpack-bundle-analyzer');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob-all');
const path = require('path');

module.exports = {
  configureWebpack: {
    plugins: [
      // new analyzer.BundleAnalyzerPlugin(),
      new PurgecssPlugin({
        paths: glob.sync([
          path.join(__dirname, './src/index.html'),
          path.join(__dirname, './**/*.vue'),
          path.join(__dirname, './src/**/*.js'),
        ]),
      }),
    ],
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch');
  },
};
