const jwt = require('jsonwebtoken');

module.exports = {

  getUserFromRestifyRequest: async function(request, db) {
    const decoded = jwt.decode(request.headers.authorization);
    if (!decoded || !decoded.username) return null;
    const user = await db.getUserByUsername(decoded.username);
    return user || null;
  }

}
