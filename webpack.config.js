const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: path.join(__dirname, './bin'),
        filename: 'app.js',
    },
    devServer: {
        contentBase: [path.join(__dirname, "bin"), path.join(__dirname, "assets")],
        compress: true,
        hot: true,
        port: 8888
    },
    plugins: [
        new webpack.IgnorePlugin(/^fs$/)
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
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
}
