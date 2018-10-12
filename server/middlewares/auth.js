const verifyJWTToken = require('../libs/auth');

function getToken(req) {
  return req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies['access-token'];
}

module.exports = function verifyJWT(req, res, next) {
  const token = getToken(req);

  verifyJWTToken(token)
    .then((decodedToken) => {
      req.user = decodedToken.data;
      next();
    })
    .catch((err) => {
      res.sendStatus(401);
    });
};
