// Imports
const restify = require('restify');
const diskdb = require('diskdb');
const fs = require('fs');

// Actual constants
const CONFIG_FILE = './nulist-config.json';

// Globals
var server;  // Restify server instance
var config;  // POJO config object from CONFIG_FILE
var db;      // DiskDB db connection instance

// "Controllers"
var users;
var items;

function configure() {
  try { config = JSON.parse(fs.readFileSync(CONFIG_FILE)); }
  catch (e) {console.warn(`Warning, could not read file ${CONFIG_FILE}`);}

  // Configure database
  db = diskdb.connect('./data', [
    'users', 'items'
  ]);

  // Configure server
  server = restify.createServer();
  server.use(restify.plugins.bodyParser({mapParams: true}));
  server.use(restify.plugins.requestLogger());
}

function makeControllers() {
  users = require('./controllers/users')(server, config, db);
  items = require('./controllers/items')(server, config, db);
}

function drawRoutes() {

  // App endpoints
  server.get('/*', restify.plugins.serveStatic({ directory: './app-ng6/', default: 'index.html' }))

  // User routes
  server.post('/register', users.register);
  server.post('/login', users.login);
  server.get('/me', users.me);
  server.get('/all', users.all);
  server.get('/count', users.count);

  // Item routes
  server.get('/items', items.mine);
  server.post('/item', items.create);
  server.put('/item', items.update);
  server.put('/item/:id/check', items.check);
  server.put('/item/:id/uncheck', items.uncheck);
  server.del('/item/:id', items.delete);
}

function main() {
  configure();
  makeControllers();
  drawRoutes();
  server.listen(config.port, () => {console.log(`${server.name} listening on port ${server.url}`)});
}

main();
