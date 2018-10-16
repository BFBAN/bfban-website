const { verifyJWTToken } = require('../libs/auth');

function getToken(req) {
  return req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies['access-token'];
}

function verifyJWT(req, res, next) {
  const token = getToken(req);

  verifyJWTToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((err) => {
      res.sendStatus(401);
    });
}

function verifyPrivilege(req, res, next) {
  const { userPrivilege } = req.user;

  if (userPrivilege === 'normal') {
    res.json({
      error: 1,
      msg: 'no privilege',
    });
  } else {
    next();
  }
}

module.exports = {
  verifyJWTMiddleware: verifyJWT,
  verifyPrivilegeMiddleware: verifyPrivilege,
};
