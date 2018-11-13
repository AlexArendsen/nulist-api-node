const userUtils = require('../services/users');

module.exports = function(server, config, db) {

  const _setChecked = async function(request, response, next, checked) {
    const user = await userUtils.getUserFromRestifyRequest(request, db);
    const item = await db.getItemByIdAndOwner(request.params.id, user._id);

    if (!item) return next(new Error('No item with given ID belongs to current user'));
    await db.setItemChecked(item._id, checked);

    response.send(item)
    next();
  }

  return {

    registerRoutes() {

      // Item routes
      server.get('/api/items', this.mine);
      server.post('/api/item', this.create);
      server.put('/api/item', this.update);
      server.put('/api/item/:id/check', this.check);
      server.put('/api/item/:id/uncheck', this.uncheck);
      server.del('/api/item/:id', this.delete);

    },

    // GET: /items
    async mine(request, response, next) {
      try {
        const user = await userUtils.getUserFromRestifyRequest(request, db);
        response.send(await db.getItemsByOwner(user._id))
      } catch (e) {
        response.send([]);
      }
      next();
    },

    // POST: /item
    async create(request, response, next) {
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
    async update(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      const item = await db.getItemByIdAndOwner(request.body._id, user._id);

      if (!item) return next(new Error('No such item found'));

      if(request.body.title) item.title = request.body.title;
      if(request.body.description !== undefined) item.description = request.body.description;
      if(request.body.parent_id !== undefined) item.parent_id = request.body.parent_id;

      await db.updateItem(item);
      response.send(item);

      next();
    },

    // PUT: /item/:id/(un)check
    async check(request, response, next) { await _setChecked(request, response, next, true); },
    async uncheck(request, response, next) { await _setChecked(request, response, next, false); },

    // DELETE: /item/:id
    async delete(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      const item = await db.getItemByIdAndOwner(request.params.id, user._id);
      if (!item) next(new Error('No item with given ID is owned by current user'));

      await db.deleteItem(request.params.id);
      response.send(item);
      next();
    }

  }

}
