var webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/index.js'
  ],
  output: {
    publicPath: '/dist/',
    path: __dirname + '/dist/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ],
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};
