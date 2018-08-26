const jwt = require('jsonwebtoken');

module.exports = {

  getUserFromRestifyRequest: function(request, db) {
    const reject = () => { throw new Error(`No user found (token: ${request.headers.authorization})`); }

    const decoded = jwt.decode(request.headers.authorization);
    if (!decoded || !decoded.username) reject();
    const user = db.getUserByUsername(decoded.username);
    return user || reject();
  }

}
