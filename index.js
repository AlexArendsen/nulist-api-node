// Imports
const restify = require('restify');
const fs = require('fs');

// Actual constants
const CONFIG_FILE = './nulist-config.json';

// Globals
let server;  // Restify server instance
let config;  // POJO config object from CONFIG_FILE
let db;      // DB implementation

function configure() {
  try { config = JSON.parse(fs.readFileSync(CONFIG_FILE)); }
  catch (e) {console.warn(`Warning, could not read file ${CONFIG_FILE}`, e);}

  // Configure database
  db = require(config.databaseDriver)(config);

  // Configure server
  server = restify.createServer();
  server.use(restify.plugins.bodyParser({mapParams: true}));
}

function makeControllers() {
  return [
    require('./controllers/users')(server, config, db),
    require('./controllers/items')(server, config, db)
  ];
}

function drawRoutes() {
  // App endpoints
  server.get('/*', restify.plugins.serveStatic({ directory: './app-ng6/', default: 'index.html' }))
}

function main() {
  configure();
  makeControllers().forEach(c => c.registerRoutes());
  drawRoutes();
  server.listen(config.port, () => {console.log(`${server.name} listening on port ${server.url}`)});
}

main();
