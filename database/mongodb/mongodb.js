const mongoClient = require('mongodb').MongoClient;

module.exports = function(config) {

  const protocol = config.database.mongodb.protocol;
  const host = config.database.mongodb.host;
  const path = config.database.mongodb.path;
  const username = process.env.MONGODB_USER
  const password = process.env.MONGODB_SECRET
  const url = `${protocol}://${username}:${password}@${host}/${path}`

  const database = config.database.mongodb.database;

  const query = async (action) => {

    const client = await mongoClient.connect(url, {useNewUrlParser: true});
    const db = client.db(database);
    const result = await action(db);
    client.close();

    return result;

  }

  return {

    async createUser(username, passwordHash) {
      return await query(async (db) => {
        const users = db.collection('users');
        const stuff = await users.insertOne({username, password: passwordHash});
        const user = await users.findOne({_id: stuff.insertedId});
        return user; 
      });
    },

    async getUserByUsername(username) {
      return await query(async (db) => await db.collection('users').findOne({ username }));
    },

    async getUserById(userId) {
      return await query(async (db) => await db.collection('users').findOne({ _id: userId }));
    },

    async getAllUsers() {
      return await query(async (db) => await db.collection('users').find({}).toArray());
    },

    async getUserCount() {
      return await query(async (db) => await db.collection('users').count());
    },
    


    async getItemsByOwner(userId) {
      return await query(async (db) => await db.collection('items').find({user_id: userId}).toArray());
    },

    async getItemByIdAndOwner(itemId, userId) {
      return await query(async (db) => await db.collection('items').findOne({user_id: userId, _id: itemId}));
    },

    async createItem(item) {
      return await query(async (db) => {
        const items = db.collection('items');
        const result = await items.insertOne(item);
        return await items.findOne({ _id: result.insertedId });
      });
    },

    async updateItem(item) {
      return await query(async (db) => {
        const items = db.collection('items');
        await items.updateOne({ _id: item._id }, item);
        return await items.findOne({ _id: item._id });
      });
    },

    async deleteItem(itemId) { /* Not yet implemented */ },

    async setItemChecked(itemId, checked) {
      return await query(async (db) => {
        const items = db.collection('items');
        await items.updateOne({ _id: itemId }, {checked});
        return await items.findOne({ _id: itemId });
      });
    }

  }

}
