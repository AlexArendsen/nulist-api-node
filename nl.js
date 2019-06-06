const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./nulist-config.json'));
const db = require('./database/mongodb/mongodb')(config);
const jwt = require('jsonwebtoken');
const opn = require('opn');

const cli = {

  'get-jwt': function(username) {
    console.log(jwt.sign({username: username}, process.env.JWT_SECRET));
  },

  'get-user': async function(username) {
    const user = await db.getUserByUsername(username);
    console.log(user);
  },

  'get-meta': async function() {
    console.log('Fetching metadata');
    console.log(await db.getMetadata());
  },

  'set-url': async function(url) {
    console.log('Setting app URL to', url);
    const data = await db.updateMetadata({appUrl: url});
    console.log('Metadata updated:', data);
  },

  'open': async function() {
    const meta = await db.getMetadata();
    opn(meta.appUrl);
  },

  'get-deleted-items': async function(userId) {
    const items = await db.getDeletedItemsByOwner(userId);
    items.reverse();
    console.log(items);
  },

  'search-items': async function(userId, query) {
    const items = (await db.getItemsByOwner(userId)).filter(i => i.title.indexOf(query) !== -1);
    items.reverse();
    console.log(items);
  },
  
  'undelete-item': async function(itemId) {
    console.log(await db.undeleteItem(itemId));
  },

  'delete-item': async function(itemId) {
    console.log(await db.deleteItem(itemId));
  },

  'move-to-root': async function(itemId) {
    console.log(await db.updateManyItems([itemId], { parent_id: null }))
  }

};

function main() {
  if (process.argv.length <= 2) console.error(`Usage: ${0} ${1} <command> <arguments>`);

  try {
    const command = process.argv[2]
    const args = process.argv.slice(3);
    cli[command](...args);
  } catch (e) { console.error('Error while executing command: ', e); }
}

main();

