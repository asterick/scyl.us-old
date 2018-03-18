const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: process.env.NODE_ENV || "development",
    entry: './client/index.jsx',
    output: {
        path: path.join(__dirname, './assets'),
        filename: 'app.js',
    },
    plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        new webpack.IgnorePlugin(/^text-encoding$/),
        new webpack.IgnorePlugin(/^fs$/)
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [ { loader: 'babel-loader' } ],
            }
      ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    }
};
