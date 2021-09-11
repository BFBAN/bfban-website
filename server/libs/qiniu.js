const qiniu = require('qiniu');
const config = require('../config');

const { accessKey, secretKey } = config.qiniu;
const bucket = 'bf1ban';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const qConfig = new qiniu.conf.Config();


// 七牛云存储空间所对应的上传地址
// 华东: (z0):
//     服务器端上传地址：http(preview.svg)://up.qiniup.com
//     客户端上传地址: http(preview.svg)://upload.qiniup.com
// 华北: (z1):
//     服务器端上传地址：http(preview.svg)://up-z1.qiniup.com
//     客户端上传: http(preview.svg)://upload-z1.qiniup.com
// 华南: (z2):
//     服务器端上传地址：http(preview.svg)://up-z2.qiniup.com
//     客户端上传: http(preview.svg)://upload-z2.qiniup.com
// 北美: (na0):
//     服务器端上传地址：http(preview.svg)://up-na0.qiniup.com
//     客户端上传地址: http(preview.svg)://upload-na0.qiniup.com
// 新加坡: (as0):
//     服器端上传地址：http(preview.svg)://up-as0.qiniu.com
//     客户端上传地址：http(preview.svg)://upload-as0.qiniu.com


// 生成 upload token
function generateUploadToken() {
  // 上传策略参数 https://developer.qiniu.com/kodo/manual/1206/put-policy
  // https://github.com/qiniu/nodejs-sdk/blob/master/qiniu/storage/rs.js
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket,
    mimeLimit: 'image/*;video/mp4',
    expires: 60 * 60 * 24 * 365, // 一年有效期 正确参数是expires， 傻逼七牛文档
    returnBody: '{"key":$(key),"hash":$(etag),"w":$(imageInfo.width),"h":$(imageInfo.height),"ext":$(ext)}', // 在一次傻逼七牛文档，明明这里是要放可以被JSON parse的string 格式

    // opts...
  });

  const uploadToken = putPolicy.uploadToken(mac);

  console.log('generated qiniu upToken: ', uploadToken);

  return uploadToken;
}


// 私有空间文件访问
function generatePrivateDownloadUrl() {
  const bucketManager = new qiniu.rs.BucketManager(mac, qConfig);
  const privateBucketDomain = 'http://c.bamket.com';
  const deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
  const key = 'test.mp4';
  const privateDownloadUrl = bucketManager.privateDownloadUrl(privateBucketDomain, key, deadline);

  console.log(`${privateDownloadUrl}&attname=${encodeURIComponent('你好.mp4')}`);
}

function getFileStat() {
  // 获取文件信息 （判断文件是否存在）
  const bucket1 = 'wu-gong-shan';
  const key = 'qiniux.mp4';

  const bucketManager = new qiniu.rs.BucketManager(mac, qConfig);
  bucketManager.stat(bucket1, key, (err, respBody, respInfo) => {
    if (err) {
      console.log(err);
      // throw err;
    } else if (respInfo.statusCode === 200) {
      console.log(respBody.hash);
      console.log(respBody.fsize);
      console.log(respBody.mimeType);
      console.log(respBody.putTime);
      console.log(respBody.type);
    } else {
      console.log(respInfo.statusCode);
      console.log(respBody.error);

      console.log('文件不存在');
    }
  });
}

module.exports = {
  generateUploadToken,
};
