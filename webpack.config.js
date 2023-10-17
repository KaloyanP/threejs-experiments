const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildPath = './build/';

module.exports = {
  entry: ['./src/entry.js'],
  output: {
    path: path.join(__dirname, buildPath),
    filename: '[name].[hash].js'
  },
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },{
        test: /\.(vert|frag|glsl|shader|txt)$/i,
        use: 'raw-loader',
        exclude: path.resolve(__dirname, './node_modules/')
      },{
        type: 'javascript/auto',
        test: /\.(json)/,
        exclude: path.resolve(__dirname, './node_modules/'),
        use: [{
          loader: 'file-loader'
        }],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({'title': 'Circle project'})
  ]
}
