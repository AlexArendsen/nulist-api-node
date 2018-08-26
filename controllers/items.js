const userUtils = require('../services/users');

module.exports = function(server, config, db) {

  const _setChecked = function(request, response, next, checked) {
    const user = userUtils.getUserFromRestifyRequest(request, db);
    const item = db.getItemByIdAndOwner(request.params.id, user._id);

    if (!item) return next(new Error('No item with given ID belongs to current user'));
    db.setItemChecked(item._id, checked);

    response.send(item)
    next();
  }

  return {

    // GET: /items
    mine: function(request, response, next) {
      try {
        const user = userUtils.getUserFromRestifyRequest(request, db);
        response.send(db.getItemsByOwner(user._id))
      } catch (e) {
        response.send([]);
      }
      next();
    },

    // POST: /item
    create: function(request, response, next) {
      const user = userUtils.getUserFromRestifyRequest(request, db);
      const item = {
        title: request.body.title,
        description: request.body.description,
        parent_id: request.body.parent_id || undefined,
        user_id: user._id,
        checked: false
      };
      db.createItem(item);
      response.send(item);
      next();
    },

    // PUT: /item
    update: function(request, response, next) {
      const user = userUtils.getUserFromRestifyRequest(request, db);
      const item = db.getItemByIdAndOwner(request.body._id, user._id);

      if (!item) return next(new Error('No such item found'));

      if(request.body.title) item.title = request.body.title;
      if(request.body.description) item.description = request.body.description;
      if(request.body.parent_id) item.parent_id = request.body.parent_id;

      db.udpateItem(item);
      response.send(item);

      next();
    },

    // PUT: /item/:id/(un)check
    check: function(request, response, next) { _setChecked(request, response, next, true); },
    uncheck: function(request, response, next) { _setChecked(request, response, next, false); },

    // DELETE: /item/:id
    delete: function(request, response, next) {
      const user = userUtils.getUserFromRestifyRequest(request, db);
      const item = db.getItemByIdAndOwner(request.params.id, user._id);
      if (!item) next(new Error('No item with given ID is owned by current user'));

      db.deleteItem(request.params.id);
      response.send(item);
      next();
    }

  }

}
