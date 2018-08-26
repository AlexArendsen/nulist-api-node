const userUtils = require('../services/users');

module.exports = function(server, config, db) {

  const _setChecked = async function(request, response, next, checked) {
    const user = userUtils.getUserFromRestifyRequest(request, db);
    const item = db.getItemByIdAndOwner(request.params.id, user._id);

    if (!item) return next(new Error('No item with given ID belongs to current user'));
    await db.setItemChecked(item._id, checked);

    response.send(item)
    next();
  }

  return {

    // GET: /items
    mine: async function(request, response, next) {
      try {
        const user = await userUtils.getUserFromRestifyRequest(request, db);
        response.send(await db.getItemsByOwner(user._id))
      } catch (e) {
        response.send([]);
      }
      next();
    },

    // POST: /item
    create: async function(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      const item = {
        title: request.body.title,
        description: request.body.description,
        parent_id: request.body.parent_id || undefined,
        user_id: user._id,
        checked: false
      };

      await db.createItem(item);
      response.send(item);
      next();
    },

    // PUT: /item
    update: async function(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      const item = await db.getItemByIdAndOwner(request.body._id, user._id);

      if (!item) return next(new Error('No such item found'));

      if(request.body.title) item.title = request.body.title;
      if(request.body.description) item.description = request.body.description;
      if(request.body.parent_id) item.parent_id = request.body.parent_id;

      await db.updateItem(item);
      response.send(item);

      next();
    },

    // PUT: /item/:id/(un)check
    check: async function(request, response, next) { await _setChecked(request, response, next, true); },
    uncheck: async function(request, response, next) { await _setChecked(request, response, next, false); },

    // DELETE: /item/:id
    delete: async function(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      const item = await db.getItemByIdAndOwner(request.params.id, user._id);
      if (!item) next(new Error('No item with given ID is owned by current user'));

      await db.deleteItem(request.params.id);
      response.send(item);
      next();
    }

  }

}
