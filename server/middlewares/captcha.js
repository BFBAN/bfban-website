const { secret } = require('../config');
const { decrypt } = require('../libs/misc');

function verifyCatpcha(req, res, next) {
  const cookieCaptcha = req.cookies.encryptCaptcha || req.body.encryptCaptcha || req.headers['x-encrypt-captcha'];
  const userCaptcha = req.body.captcha.toLowerCase();

  try {
    const content = decrypt(cookieCaptcha, secret);

    const decryptUserCaptcha = content.split('|')[0];
    const timeStamp = content.split('|')[1];

    console.log(`decryptUserCaptcha, timeStamp : ${decryptUserCaptcha}, ${timeStamp}`);

    // 2 minutes
    if (Date.now() - timeStamp > 1000 * 60 * 2) {
      return res.json({
        error: 1,
        msg: 'captcha expires',
      });
    }
    if (decryptUserCaptcha !== userCaptcha) {
      return res.json({
        error: 1,
        msg: 'wrong captcha',
      });
    }
    next();
  } catch (e) {
    next(e);
    return res.json({
      error: 1,
      msg: 'invalid captcha',
    });
  }
}

module.exports = {
  verifyCatpcha,
};
