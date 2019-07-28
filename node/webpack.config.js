const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = env => {
    const isDev = !!env && env.hasOwnProperty('development');

    console.log({ isDev }, 'using', isDev ? 'development' : 'production');

    return {
        mode: isDev ? 'development' : 'production',
        entry: {
            style: path.resolve(__dirname, 'src', 'styles', 'styles.scss'),
            multiplayer: path.resolve(__dirname, 'src', 'js', 'pages', 'multiplayer.js'),
            login: path.resolve(__dirname, 'src', 'js', 'pages', 'login.js'),
            register: path.resolve(__dirname, 'src', 'js', 'pages', 'register.js'),
            online: path.resolve(__dirname, 'src', 'js', 'pages', 'online.js'),
            profile: path.resolve(__dirname, 'src', 'js', 'pages', 'profile.js'),
            leaderboard: path.resolve(__dirname, 'src', 'js', 'pages', 'leaderboard.js'),
        },
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: 'js/[name].bundle.js',
        },
        resolve: {
            alias: {
                vue: isDev ? 'vue/dist/vue' : 'vue/dist/vue.min.js',
                validator: 'validator/validator.js',
            },
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
            }),
            new MiniCssExtractPlugin({
                filename: 'css/main.css',
            }),
            new webpack.ProvidePlugin({
                Vue: 'vue',
                validator: 'validator',
            }),
            ...(!isDev
                ? [
                      new CompressionPlugin({
                          // asset: "[path].gz[query]",
                          algorithm: 'gzip',
                          test: /\.js$|\.css$|\.html$/,
                          // threshold: 10240,
                          minRatio: 0.8,
                      }),
                  ]
                : []),
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
                        'sass-loader',
                    ],
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
            ],
        },

        optimization: {
            splitChunks: {
                cacheGroups: {
                    vue: {
                        test: /[\\/]node_modules[\\/](.*vue.*)[\\/]/,
                        name: 'vue',
                        chunks: 'all',
                        minSize: 0,
                        maxInitialRequests: Infinity,
                    },
                },
            },

            minimizer: [
                ...(!isDev
                    ? [
                          new UglifyJsPlugin({
                              test: /\.js(\?.*)?$/i,
                              uglifyOptions: {
                                  comments: false, // remove comments
                                  compress: {
                                      unused: true,
                                      dead_code: true, // big one--strip code that will never execute
                                      drop_debugger: true,
                                      conditionals: true,
                                      evaluate: true,
                                      drop_console: true, // strips console statements
                                      sequences: true,
                                      booleans: true,
                                  },
                              },
                          }),
                          new OptimizeCSSAssetsPlugin({
                              cssProcessorPluginOptions: {
                                  preset: [
                                      'default',
                                      {
                                          discardComments: {
                                              removeAll: true,
                                          },
                                      },
                                  ],
                              },
                              canPrint: true,
                          }),
                      ]
                    : []),
            ],
        },

        devtool: isDev ? 'cheap-module-eval-source-map' : 'cheap-source-map',

        devServer: {
            contentBase: path.join(__dirname, 'public'),
            port: 8000,

            proxy: {
                '/': {
                    target: `http://localhost:${3000}`,
                },
            },
        },
    };
};
