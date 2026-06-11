// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const creative = require('./package.json');

const isProduction = process.env.NODE_ENV == 'production';
const dateString = 'Updated : ' + (new Date()).toISOString().substring(0, 10);


class UidBannerPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('UidBannerPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'UidBannerPlugin',
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
                },
                () => {
                    const assetName = Object.keys(compilation.assets).find((name) => name.endsWith('uid.js'));
                    if (assetName) {
                        const asset = compilation.getAsset(assetName);
                        compilation.updateAsset(
                            assetName,
                            new webpack.sources.RawSource('/* v' + creative.version + '\n' + dateString + ' */\n' + asset.source.source())
                        );
                    }
                }
            );
        });
    }
}

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
        'uid': './src/ssp-userids/uid.js',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: (pathData) => {
            if (isProduction && pathData.chunk.name === 'uid') {
                return '../dist/uid.js';
            }
            return '[name].js';
        },
    },
    devServer: {
        host: 'localhost',
        static: 'dist'
    },
    plugins: [
        htmlFile('load-cookie'),
        htmlFile('load-cookie-with-consent'),
    ].concat(isProduction ? [
        new UidBannerPlugin()
    ] : []),
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
