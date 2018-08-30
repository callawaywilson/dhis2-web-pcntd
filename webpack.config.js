// 
// Some logic and code taken from the DHIS2 maintenance-app
// https://github.com/dhis2/maintenance-app
// 
const path = require('path');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const devMode = process.env.NODE_ENV !== 'production'

// Load DHIS2 configuration for proxy server
const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
var dhisConfig;
try {
    dhisConfig = require(dhisConfigPath);
} catch (e) {
    console.warn(`\nWARNING! Failed to load DHIS config:`, e.message);
    console.info('Using default config');
    dhisConfig = {
        baseUrl: 'http://localhost:8080/',
        authorization: 'Basic YWRtaW46ZGlzdHJpY3Q=', // admin:district
    };
}
// Pass on DHIS2 authoriztion proxied requests
function bypass(req, res, opt) {
  req.headers.Authorization = dhisConfig.authorization;
}

const scriptPrefix = (isDevBuild ? dhisConfig.baseUrl : '..');


module.exports = {
  module: {
    rules: [
      {test: /manifest.webapp/},
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  externals: [
    {
      'react': 'var React',
      'react-dom': 'var ReactDOM',
      'rx': 'var Rx',
      'react-addons-transition-group': 'var React.addons.TransitionGroup',
      'react-addons-create-fragment': 'var React.addons.createFragment',
      'react-addons-update': 'var React.addons.update',
      'react-addons-pure-render-mixin': 'var React.addons.PureRenderMixin',
      'react-addons-shallow-compare': 'var React.addons.ShallowCompare',
      'lodash': 'var _',
      'lodash/fp': 'var fp',
    },
    /^react-addons/,
    /^react-dom$/,
    /^rx$/,
    /^lodash$/,
    /^lodash\/fp$/,
  ],
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ 
      template: './src/index.ejs', 
      filename: './index.html',
      vendorScripts: [
        `/dhis-web-core-resource/babel-polyfill/6.20.0/dist/polyfill${isDevBuild ? '' : '.min'}.js`,
        `/dhis-web-core-resource/react/15.4.2/react-with-touch-tap-plugin${isDevBuild ? '' : '.min'}.js`,
        `/dhis-web-core-resource/rxjs/4.1.0/rx.lite${isDevBuild ? '' : '.min'}.js`,
        `/dhis-web-core-resource/lodash/4.15.0/lodash${isDevBuild ? '' : '.min'}.js`,
        `/dhis-web-core-resource/lodash-functional/1.0.1/lodash-functional.js`,
        [`/dhis-web-core-resource/ckeditor/4.6.1/ckeditor.js`, 'defer async'],
      ].map(script => {
        if (Array.isArray(script)) {
          return (`<script ${script[1]} src="${script[0]}"></script>`);
        }
        return (`<script src="${script}"></script>`);
      }).join("\n")
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    }),
    new CopyWebpackPlugin([{ from: 'src/manifest.webapp', to: 'manifest.webapp' }]),
    new ZipPlugin({
      filename: 'dhis2-web-pcntd.zip'
    })
  ],
  devServer: {
    port: 8081,
    inline: true,
    compress: true,
    proxy: [
      {
        context: [
          '/api/**',
          '/dhis-web-commons/**',
          '/dhis-web-core-resource/**',
          '/icons/**',
          '/css/**',
          '/images/**',
        ],
        target: dhisConfig.baseUrl,
        changeOrigin: false,
        bypass,
      },
    ],
    watchOptions: {
        aggregateTimeout: 2000,
    },
  }
};