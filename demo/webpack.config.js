'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const args = require('yargs').argv;

const env = args.env;
const isDeploy = env === 'production';
const config = {
    entry: {
        test: path.resolve(__dirname, 'app.js')
    },
    output: {
        path: path.resolve(__dirname, '../demo'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                enforce: 'pre',
                options: {
                    fix: true
                }
            },
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader'
                }]
            }
        ]
    },
    devtool: isDeploy ? false : 'inline-source-map'
};
if (isDeploy) {
    config.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(env)
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ];
}
module.exports = config;