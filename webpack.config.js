'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'electron',
    entry: {
        'main': './src/main.js',
        'renderer/index': './src/renderer/index.js'
    },
    output: {
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: '/node_modules/',
                query: {
                    presets: [
                        'es2015',
                        'react'
                    ]
                }
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    node: {
        __dirname: false,
        __filename: false
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({sourceMap: true})
    ],
    devtool: 'source-map'
};