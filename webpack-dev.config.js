var commonConfig = require('./webpack-common.config.js');
var nodeExternals = require('webpack-node-externals');
//http://www.c-sharpcorner.com/uploadfile/asmabegam/asp-net-mvc-5-security-and-c
// reating-user-role/
// https://code.msdn.microsoft.com/MVC-ASPNET-Identity-7cd386d3
// http://techbrij.com/role-based-menu-asp-net-mvc
var devLoaders = [
  // javascript/jsx loader - https://www.npmjs.com/package/babel-loader - with the
  // react-hot loader
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loaders: ['react-hot', 'babel-loader?stage=0&optional=runtime']
  }, {
    test: /\.css$/,
    loader: 'style-loader!css-loader'
  }
]

module.exports = [
  {
    entry: [
      // setup the hot mobule loading
      'webpack-dev-server/client?http://localhost:3010',
      'webpack/hot/only-dev-server',
      // our entry file
      './app/main.js'
    ],
    output: {
      path: './build',
      filename: 'bundle.[hash].js'
    },
    devtool: 'eval',
    devServer: {
      // proxy calls to api to our own node server backend
      proxy: {
        '/api/*': 'http://localhost:5000/'
      },
      port: 3010
    },
    module: {
      loaders: commonConfig
        .loaders
        .concat(devLoaders)
    },
    plugins: [commonConfig.indexPagePlugin]
  }, {
    target: 'node',
    devtool: 'eval',
    externals: [nodeExternals()],
    entry: ['./server/config/worker-config.js'],
    output: {
      path: './build',
      filename: 'server-bundle.js'
    },
    module: {
      loaders: commonConfig
        .loaders
        .concat(devLoaders)
    },
    plugins: [commonConfig.indexPagePlugin]
  }
];
