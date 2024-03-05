// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

function htmlFile(name) {
    return new HtmlWebpackPlugin({
        template: 'pug-loader!load-cookie.pug',
        filename: path.join(path.resolve(__dirname, 'dist'), `${name}.html`),
        inject: false,
        templateParameters: (compilation) => {
            return {
                source: compilation.getAsset(`${name}.js`).source.source()
            }
        }
    })
}

const config = {
    entry: {
        'load-cookie': './src/loadCookie.js',
        'load-cookie-with-consent': './src/loadCookieWithConsent.js',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
    },
    devServer: {
        host: 'localhost',
        static: 'dist'
    },
    plugins: [
        htmlFile('load-cookie'),
        htmlFile('load-cookie-with-consent'),
    ],
    resolve: {
        modules: [
            path.resolve('./src/'),
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                exclude: path.resolve('./node_modules'), // required to prevent loader from choking non-Prebid.js node_modules
                loader: 'babel-loader',
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';

    } else {
        config.mode = 'development';
        config.devtool = 'source-map'
    }
    return config;
};
