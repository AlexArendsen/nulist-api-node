const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

module.exports = function(config) {

  const protocol = config.database.mongodb.protocol;
  const host = config.database.mongodb.host;
  const path = config.database.mongodb.path;
  const username = process.env.MONGODB_USER
  const password = process.env.MONGODB_SECRET

  if (!username || !password)
    throw new Error(`MongoDB username (${username && 'present'}) and password (${password && 'present'}) are missing from environment. Quitting.`);

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

    // ====== User Methods
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
      return await query(async (db) => await db.collection('users').findOne({ _id: new ObjectId(userId) }));
    },

    // Deprecated
    async getAllUsers() {
      return await query(async (db) => await db.collection('users').find({}).toArray());
    },

    async getUserCount() {
      return await query(async (db) => `${await db.collection('users').countDocuments()}`);
    },

    async updateUser(userId, changes) {
      await query(async (db) => await db.collection('users')
        .updateOne({ _id: new ObjectId(userId)}, {$set: changes}))
      return await this.getUserById(userId);
    },
    

    // ====== Item Methods
    async getItemsByOwner(userId) {
      return await query(async (db) => await db.collection('items')
        .find({user_id: new ObjectId(userId)}).toArray());
    },

    async getItemByIdAndOwner(itemId, userId) {
      return await query(async (db) => await db.collection('items')
        .findOne({user_id: new ObjectId(userId), _id: new ObjectId(itemId)}));
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
        await items.updateOne({ _id: new ObjectId(item._id) }, {$set: item});
        return await items.findOne({ _id: item._id });
      });
    },

    async deleteItem(itemId) {
      return await query(async (db) => {
        const items = db.collection('items');
        const deleted = db.collection('deletedItems');

        const item = await items.findOne({ _id: new ObjectId(itemId) });
        items.deleteOne({ _id: new ObjectId(itemId) });
        deleted.insertOne(item);
        return item;
      });
    },

    async undeleteItem(itemId) {
      return await query(async (db) => {
        const items = db.collection('items');
        const deleted = db.collection('deletedItems');

        const item = await deleted.findOne({ _id: new ObjectId(itemId) });
        deleted.deleteOne({ _id: new ObjectId(itemId) });
        items.insertOne(item);
        return item;
      });
    },

    async setItemChecked(itemId, checked) {
      return await query(async (db) => {
        const items = db.collection('items');
        await items.updateOne({ _id: new ObjectId(itemId) }, {$set: {checked: checked}});
        return await items.findOne({ _id: new ObjectId(itemId)});
      });
    },

    async getDeletedItemsByOwner(userId) {
      return await query(async (db) => {
        const items = db.collection('deletedItems');
        return await items.find({user_id: new ObjectId(userId)}).toArray();
      });
    },

    // ====== Metadata Methods
    async getMetadata() {
      return await query(async (db) => {
        const fields = ['appName', 'appVersion', 'appUrl'];
        const projection = fields.reduce((obj, field) => Object.assign(obj, {[field]: 1}), {});
        const data = await db.collection('metadata').findOne({}, {projection: projection});
        return data || {};
      });
    },

    async updateMetadata(changes) {
      return await query(async (db) => {
        await db.collection('metadata').updateOne({}, {$set: changes});
        return await this.getMetadata();
      });
    },

    async initializeMetadata() {
      return await query(async (db) => {
        const init = {appName: 'NuList', appVersion: '0.0.0', appUrl: 'https://nulist-api-node-rnbhskspux.now.sh'};
        await db.collection('metadata').deleteMany({});
        await db.collection('metadata').insertOne(init);
        return await this.getMetadata();
      });
    }

  }

}
