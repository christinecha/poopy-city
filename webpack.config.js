var webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/index.js'
  ],
  output: {
    publicPath: '/dist/',
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ],
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};
