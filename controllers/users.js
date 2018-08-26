const jwt = require('jsonwebtoken');
const userUtils = require('../services/users');
const bcrypt = require('bcrypt')

module.exports = function(server, config, db) {
  return {

    // POST: /register
    register: async function(request, response, next) {

      if (!request.body.username) return next(new Error('No username provided'));
      if (await db.getUserByUsername(request.body.username)) return next(new Error('Username already taken'));
      if (!request.body.password) return next(new Error('No password provided'));

      const hash = await bcrypt.hash(request.body.password, 8);
      const user = await db.createUser(request.body.username, hash);

      console.log('Finished creating user with result:', user);
      response.send({token: jwt.sign({username: user.username}, process.env.JWT_SECRET)})
      next();
    },

    // POST: /login
    login: async function(request, response, next) {
      if (!request.body.username) return next(new Error('No username provided'));
      if (!request.body.password) return next(new Error('No password provided'));

      const user = await db.getUserByUsername(request.body.username);
      if (!user) return next(new Error('Invalid login'));

      const result = await bcrypt.compare(request.body.password, user.password);
      if (!result) return next(new Error('Invalid login'));

      response.send({token: jwt.sign({username: request.body.username}, config.jwt.secret)})
      next();

    },

    // GET: /me
    me: async function(request, response, next) {
      try { response.send(await userUtils.getUserFromRestifyRequest(request, db)); }
      catch (e) {response.send(null)}
      next();
    },

    // GET: /all
    all: async function(request, response, next) {
      response.send(await db.getAllUsers());
      next();
    },

    // GET: /count
    count: async function(request, response, next) {
      response.send(await db.getUserCount());
      next();
    }

  }

}
