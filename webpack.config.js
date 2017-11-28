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
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                  'style-loader',
                  'css-loader?importLoaders=1&modules=true&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
                  'postcss-loader'
                ]
            }
      ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
    }
};
