const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry:[`./src/Injector.ts`],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    // library: 'jbbSdk',
    libraryTarget: 'umd',
    // umdNamedDefine: true
    // libraryTarget: 'commonjs',
    // libraryExport: 'default'
  },
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions:['.js','.ts']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
            ],
          },
        },
        exclude:[
          /node_modules/
        ],
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
            ],
          },
        }, 'ts-loader'],
        exclude:[
          /node_modules/,
        ],
      },
    ],
  },
  plugins: [
    // new UglifyJsPlugin()
  ],
  stats: {colors: true},
  devtool: 'none',
  // devtool: 'inline-source-map',
  // externals: {
  //   '@scatterjs/core': 'ScatterJS'
  // }
}
