const jwt = require('jsonwebtoken');
const userUtils = require('../services/users');
const bcrypt = require('bcrypt')
const recaptchaUtils = require('../services/recaptcha.js')

module.exports = function(server, config, db) {
  return {

    registerRoutes() {

      // User routes
      server.post('/api/register', this.register);
      server.post('/api/login', this.login);
      server.get('/api/me', this.me);
      server.get('/api/all', this.all); // Deprecated
      server.get('/api/count', this.count);

    },

    // POST: /register
    async register(request, response, next) {

      if (!(await recaptchaUtils.verify(request.body.recaptcha))) return next(new Error('Could not verify recaptcha'));
      if (!request.body.username) return next(new Error('No username provided (did you forget the content-type?)'));
      if (await db.getUserByUsername(request.body.username)) return next(new Error('Username already taken'));
      if (!request.body.password) return next(new Error('No password provided'));
      if (request.body.password !== request.body.confirmPassword) return next(new Error('Passwords do not match'));

      const hash = await bcrypt.hash(request.body.password, 8);
      const user = await db.createUser(request.body.username, hash);

      response.send({token: jwt.sign({username: user.username}, process.env.JWT_SECRET)})
      next();
    },

    // POST: /login
    async login(request, response, next) {
      if (!request.body.username) return next(new Error('No username provided (did you forget the content-type?)'));
      if (!request.body.password) return next(new Error('No password provided'));

      const user = await db.getUserByUsername(request.body.username);
      if (!user) return next(new Error('Invalid login'));

      const result = await bcrypt.compare(request.body.password, user.password);
      if (!result) return next(new Error('Invalid login'));

      response.send({token: jwt.sign({username: request.body.username}, process.env.JWT_SECRET)})
      next();

    },

    // GET: /me
    async me(request, response, next) {
      const user = await userUtils.getUserFromRestifyRequest(request, db);
      try { response.send(Object.assign(user, {password: ''})); }
      catch (e) {response.send(null)}
      next();
    },

    // GET: /all
    // Deprected
    async all(request, response, next) {
      response.send([]);
      next();
    },

    // GET: /count
    async count(request, response, next) {
      response.send(await db.getUserCount());
      next();
    }

  }

}
