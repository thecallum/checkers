  
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (undefined, argv) => {
    return {
        mode: 'development',
        entry: path.resolve(__dirname, 'src', 'App.js'),
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: 'js/bundle.js',
        },
        // resolve: {
        //     alias: {
        //         vue: 'vue/dist/vue.common.js',
        //         velocity: 'velocity-animate/velocity.js'
        //     }
        // },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/main.css',
            }),
        ],
     
        module: {
            rules: [
                {
                    test: /\.(s*)css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ],
        },
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            open: false,
        }
    }
}