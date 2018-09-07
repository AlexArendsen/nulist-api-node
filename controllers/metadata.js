const userUtils = require('../services/users.js');

module.exports = function(server, config, db) {
  return {

    registerRoutes() {
      server.get('/api/meta', this.fetch);
      server.put('/api/meta/update', this.update);
      server.post('/api/meta/initialize', this.initialize);
    },

    // GET: /meta
    async fetch(request, response, next) {
      response.send(await db.getMetadata());
      next();
    },

    // PUT: /update/:id
    async update(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      if (!user || !user.isAdmin) return next(new Error('You are not authorized for this action'));
      response.send(await db.updateMetadata(request.body.changes));
      next();
    },

    // POST: /initialize
    async initialize(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      if (!user || !user.isAdmin) return next(new Error('You are not authorized for this action'));
      response.send(await db.initializeMetadata());
      next();
    }

  }

}
