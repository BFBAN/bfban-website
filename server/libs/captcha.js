const svgCaptcha = require('svg-captcha');
const { secret } = require('../config');
const { encrypt } = require('./misc');

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
  const content = `${text}|${Date.now()}`;
  const hash = encrypt(content, secret);

  res.cookie('encryptCaptcha', hash, {
    httpOnly: true,
  });

  res.type('svg');
  res.status(200).send(captcha.data);
}

module.exports = {
  getCaptcha,
};
