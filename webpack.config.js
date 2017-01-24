var webpack = require('webpack');

module.exports = {
  context: __dirname + '/app',
  entry: {
    app: './app.js',
    vendor: ['angular']
  },
  output: {
    path: __dirname + '/js',
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
        { test: /\.css$/,
          loader: "style!css"
        },
        { test: /\.html/,
          loader: 'raw'
        },
        {
          test: /\.js$/, exclude: /node_modules/,
          loader: 'ng-annotate!babel'
        }
      ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  ]
};
