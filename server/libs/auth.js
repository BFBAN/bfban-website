const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const config = require('../config');

function verifyJWTToken(token) {
  return new Promise(((resolve, reject) => {
    jwt.verify(token, config.secret, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }
      return resolve(decodedToken);
    });
  }));
}

function generatePassword(p) {
  return bcrypt.hashSync(p, 10);
}

function comparePassword(pw, hash) {
  return bcrypt.compareSync(pw, hash);
}
module.exports = {
  verifyJWTToken,
  generatePassword,
  comparePassword,
};
