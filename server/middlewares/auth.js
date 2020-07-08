const { verifyJWTToken } = require('../libs/auth');
const { accessToken, apiTokens } = require('../config');
const db = require('../mysql');

function getToken(req) {
  return req.body.token || req.query.token || req.cookies['access-token'] || req.get('x-access-token');
}

function verifyJWT(req, res, next) {
  const token = getToken(req);

  // special token
  if (token && token.trim() === accessToken.trim())
    return next();

  if (token && Object.keys(apiTokens).includes(token.trim())) {
    req.user = apiTokens[token.trim()];
    return next();
  }

  verifyJWTToken(token)
    .then(async (decodedToken) => {
      const { userId } = decodedToken;
      const result = await db.query('select * from users where id = ? and valid = "1"', [userId]);

      if (result.length === 0) {
        throw (new Error('invalid user'));
      }
      req.user = decodedToken;

      next();
    })
    .catch((err) => {
      next(err);
      res
        .status(401)
        .json({
        error: 1,
        msg: 'plz sign in',
      });
    });
}

// should be admin, super or root
function verifyAdminPrivilege(req, res, next) {
  const { userPrivilege } = req.user;

  const privilegeTitle = ['root', 'super', 'admin'];

  // root, super, admin, normal
  if (privilegeTitle.includes(userPrivilege)) {
    next();
  } else {
    res.json({
      error: 1,
      msg: 'no privilege',
    });
  }
}

function verifyNormalPrivilege(req, res, next) {
  const { userPrivilege } = req.user;
  if (userPrivilege && userPrivilege === 'normal') {
    return next();
  }
  return res.json({
    error: 1,
    msg: 'plz sign in',
  });
}

module.exports = {
  verifyJWTMiddleware: verifyJWT,
  verifyAdminPrivilegeMiddleware: verifyAdminPrivilege,
  verifyNormalPrivilegeMiddleware: verifyNormalPrivilege,
};
