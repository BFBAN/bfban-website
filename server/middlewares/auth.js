const { verifyJWTToken } = require('../libs/auth');
const db = require('../mysql');

function getToken(req) {
  return req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies['access-token'];
}

function verifyJWT(req, res, next) {
  const token = getToken(req);

  verifyJWTToken(token)
    .then(async (decodedToken) => {
      const { userId } = decodedToken
      const result = await db.query('select * from users where id = ? and valid = "1"', [userId]);

      if (result.length === 0) {
        throw (new Error('invalid user'));
      }
      req.user = decodedToken;

      next();
    })
    .catch((err) => {
      res.sendStatus(401);
    });
}

// should be admin
function verifyPrivilege(req, res, next) {
  const { userPrivilege } = req.user;

  // root, super, admin, normal
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
