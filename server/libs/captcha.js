const svgCaptcha = require('svg-captcha');

function getCaptcha(req, res) {
  const captcha = svgCaptcha.create({
    inverse: false,
    fontSize: 36,
    noise: 2,
    width: 80,
    height: 30,
  });

  req.session.captcha = captcha.text.toLowerCase();

  res.type('svg');
  res.status(200).send(captcha.data);
}

module.exports = {
  getCaptcha,
};
