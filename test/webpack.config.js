const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'file-loader'
            },
            {
                test: /\.elm$/,
                exclude: [ /elm-stuff/, /node_modules/ ],
                use: [
                    { loader: path.resolve(__dirname, '../src/index.js') },
                    {
                        loader: 'elm-webpack-loader',
                        options: {
                            cwd: __dirname,
                            pathToElm: '/usr/local/bin/elm',
                            debug: false
                        }
                    }
                ]
            }
        ]
    },

    plugins: [],

    mode: 'development',

    devServer: {
        hot: true,
        devMiddleware: {
            stats: 'errors-only'
        }
    }
};
