function verifyCatpcha(req, res, next) {
  const sessionCaptcha = req.session.captcha;
  const Usercaptcha = req.body.captcha;

  if (Usercaptcha !== sessionCaptcha) {
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
