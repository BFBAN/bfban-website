const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');
const { secret } = require('../config');

function getCaptcha(req, res) {
  const captcha = svgCaptcha.create({
    inverse: false,
    ignoreChars: 'aoil',
    color: false,
    fontSize: 40,
    noise: 1,
    width: 80,
    height: 40,
  });

  const text = captcha.text.toLowerCase();
  const hash = crypto.createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  res.cookie('encryptCaptcha', hash, {
    httpOnly: true,
  });

  res.type('svg');
  res.status(200).send(captcha.data);
}

module.exports = {
  getCaptcha,
};
