const crypto = require('crypto');
const { secret } = require('../config');

function verifyCatpcha(req, res, next) {
  const cookieCaptcha = req.cookies['encryptCaptcha'];
  const userCaptcha = req.body.captcha;

  const encryptUserCaptcha = crypto.createHmac('sha256', secret)
    .update(userCaptcha)
    .digest('hex');


  if (encryptUserCaptcha !== cookieCaptcha) {
    res.json({
      error: 1,
      msg: 'wrong captcha',
    });
  } else {
    next();
  }
}

module.exports = {
  verifyCatpcha,
};
