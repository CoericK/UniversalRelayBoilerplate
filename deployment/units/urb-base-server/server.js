'use strict';


require('babel-polyfill');

var _path = require('path');var _path2 = _interopRequireDefault(_path);

var _express = require('express');var _express2 = _interopRequireDefault(_express);
var _compression = require('compression');var _compression2 = _interopRequireDefault(_compression);
var _cookieParser = require('cookie-parser');var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _package = require('../_configuration/package');
var _serverWebApp = require('../urb-base-webapp/serverWebApp');var _serverWebApp2 = _interopRequireDefault(_serverWebApp);
var _serverExtensions = require('../_configuration/urb-base-server/serverExtensions');var _serverExtensions2 = _interopRequireDefault(_serverExtensions);

var _serverAuth = require('./serverAuth');var _serverAuth2 = _interopRequireDefault(_serverAuth);
var _getLocalIP = require('./getLocalIP');var _getLocalIP2 = _interopRequireDefault(_getLocalIP);
var _serverGraphQL = require('./serverGraphQL');var _serverGraphQL2 = _interopRequireDefault(_serverGraphQL);
var _serverHealthz = require('./serverHealthz');var _serverHealthz2 = _interopRequireDefault(_serverHealthz);
var _log = require('./log');var _log2 = _interopRequireDefault(_log);
var _ObjectManager = require('./graphql/ObjectManager');var _ObjectManager2 = _interopRequireDefault(_ObjectManager);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

//

// Read environment
// Health check endpoint server
// In order to use ES7 async/await
require('dotenv').load(); // GraphQL server
// Authentication server
const port = process.env.PORT;if (port == null || typeof port !== 'string') throw new Error('urb-base-server/server.js requires the environment variable PORT to be set');

const host = process.env.HOST;
if (host == null || typeof host !== 'string')
throw new Error('urb-base-server/server.js requires the environment variable HOST to be set'); // Log startup information

_log2.default.log('info', 'Starting application', {
  name: _package.name,
  version: _package.version,
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  PUBLIC_URL: process.env.PUBLIC_URL,
  process_title: process.title,
  process_pid: process.pid,
  local_ip: (0, _getLocalIP2.default)() });


// Main router
const server = (0, _express2.default)();

// Add headers
server.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_URL);

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
}); // Configure main router

server.set('trust proxy', 'loopback');
server.set('x-powered-by', false);
server.use((0, _compression2.default)());
server.use((0, _cookieParser2.default)()); // GraphQL server requires this

server.use('/graphql', _serverGraphQL2.default); // Authentication server
server.use('/auth', _serverAuth2.default); // Health check endpoint
server.use('/healthz', _serverHealthz2.default); // Static public files server
server.use(
_express2.default.static(_path2.default.resolve(__dirname + '/../_configuration/urb-base-server/public_files/'), {
  maxAge: 365 * 86400 // one year
}));


// Add extensions - custom routes
(0, _serverExtensions2.default)(server); // Application with routes
server.use(_serverWebApp2.default); // Set up all persisters

_ObjectManager2.default.initializePersisters(false, () => {
  // Serve - work differently in development and production. In production only the
  // specified host serves
  if (process.env.NODE_ENV === 'production') {
    // Production - serve as told
    server.listen(port, host);
  } else {
    // Development server - localhost. Always run on localhost
    startDevelopmentServer(port, '127.0.0.1');
    // Development server - on a specific IP, if different from localhost
    if (host !== '127.0.0.1') startDevelopmentServer(port, host);
  }
});

function startDevelopmentServer(port, host) {
  const localIPDevelopmentServer = (0, _express2.default)();
  localIPDevelopmentServer.use(server);
  localIPDevelopmentServer.listen(port, host);
}
//# sourceMappingURL=server.js.map