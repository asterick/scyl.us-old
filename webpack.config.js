const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: './client/index.jsx',
    output: {
        path: path.join(__dirname, './assets'),
        filename: 'app.js',
    },
    plugins: [
        new webpack.IgnorePlugin(/^fs$/)
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
            }
      ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    }
};
