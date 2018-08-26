const diskdb = require('diskdb');

module.exports = function(config) {

  db = diskdb.connect(config.database.diskdb.path, ['users', 'items']);

  return {

    createUser: function(username, passwordHash) { db.users.save({username, passwordHash}); },
    getUserByUsername: function(username) { return db.users.findOne({username}); },
    getUserById: function(userId) { return db.users.findOne({_id: userId}); },
    getAllUsers: function() { return db.users.find() },
    getUserCount: function() { return db.users.count(); },
    
    getItemsByOwner(userId) { return db.items.find({user_id: userId}); },
    getItemByIdAndOwner(itemId, userId) { return db.items.findOne({user_id: userId, _id: itemId}); },
    createItem: function(item) { db.items.save(item); },
    updateItem: function(item) { db.items.update({_id: item._id}, item); },
    deleteItem: function(itemId) { db.items.remove({_id: itemId}); },
    setItemChecked: function(itemId, checked) { db.items.update({_id: itemId}, {checked}); }

  }

}
