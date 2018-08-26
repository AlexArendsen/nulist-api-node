const jwt = require('jsonwebtoken');
const userUtils = require('../services/users');
const bcrypt = require('bcrypt')

module.exports = function(server, config, db) {
  return {

    // POST: /register
    register: function(request, response, next) {

      if (!request.body.username)
        return next(new Error('No username provided'));

      if (db.users.findOne({username: request.body.username}))
        return next(new Error('Username already taken'));

      if (!request.body.password)
        return next(new Error('No password provided'));

      const onSuccess = (hash) => {
        db.users.save({ username: request.body.username, password: hash });
        response.send({token: jwt.sign({username: request.body.username}, config.jwt.secret)})
        next();
      }

      bcrypt.hash(request.body.password, 8, (err, hash) => err ? next(err) : onSuccess(hash));
    },

    // POST: /login
    login: function(request, response, next) {
      if (!request.body.username) return next(new Error('No username provided'));
      if (!request.body.password) return next(new Error('No password provided'));

      const user = db.users.findOne({username: request.body.username});
      if (!user) return next(new Error('Invalid login'));

      const onComplete = (err, result) => {
        if (err) return next(err);
        if (!result) return next(new Error('Invalid login'));
        response.send({token: jwt.sign({username: request.body.username}, config.jwt.secret)})
        next();
      }

      bcrypt.compare(request.body.password, user.password, onComplete);

    },

    // GET: /me
    me: function(request, response, next) {
      try { response.send(userUtils.getUserFromRestifyRequest(request, db)); }
      catch (e) {response.send(null)}
      next();
    },

    // GET: /all
    all: function(request, response, next) {
      response.send(db.users.find());
      next();
    },

    // GET: /count
    count: function(request, response, next) {
      response.send(db.users.count());
      next();
    }

  }

}
