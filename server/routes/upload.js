const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime-types');

const express = require('express');

const uploadRouter = express.Router();

const { verifyJWTMiddleware } = require('../middlewares/auth');

const config = require('../config');


uploadRouter.use(verifyJWTMiddleware);

// ready uploads folder
const uploadsDir = path.resolve(config.baseDir, 'public/uploads');
fs.ensureDirSync(uploadsDir);
fs.chmodSync(uploadsDir, '0744');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, `${raw.toString('hex') + Date.now()}.${mime.extension(file.mimetype)}`);
    });
  },
});
const upload = multer({ storage }).single('file');


uploadRouter.post('/', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      next(err);
    }

    if (!req.file) {
      return res.json({
        error: 1,
        msg: 'please upload the file',
      });
    }

    console.log(req.file);

    return res.json({
      error: 0,
      url: `/uploads/${req.file.filename}`,
    });
  });
});

module.exports = uploadRouter;
