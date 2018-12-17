const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const argv = require('minimist')(process.argv.slice(2));

// 上传到城通网盘（公有云，开放的网盘，很适合临时存放文件供别人下载）
function uploadToCtfile(fileLoc) {
  return new Promise(async (resolve, reject) => {
    const data = new FormData();
    data.append('filesize', fs.statSync(path.resolve(fileLoc)).size);
    data.append('file', fs.createReadStream(fileLoc));

    await axios({
      method: 'post',
      url: 'https://upload.ctfile.com/web/upload.do?userid=18944557&maxsize=2147483648&folderid=0&ctt=1545220232&limit=2&spd=23000000&key=21a975c75a527c89da9140d44613cba8',
      headers: data.getHeaders(),
      data,
      // https://juejin.im/entry/5be280fdf265da61193b50db
      maxContentLength: 2147483648,

      // todo: progress
      // onUploadProgress: (pe) => {
      //   if(pe.lengthComputable) {
      //     console.log(`max = ${pe.total}, value = ${pe.loaded}, progress ${pe.loaded * 100 / pe.total}`)
      //   }
      // }
    })
      .then(res => res.data)
      .then((d) => {
        console.log(`https://u18944557.ctfile.com/fs/18944557-${d}`);
        resolve(d);
      })
      .catch((e) => {
        reject(new Error(`upload to ctfile error: ${e}`));
      });
  });
}

uploadToCtfile(argv.file);

// node upToCtfile.js --file 'xxxxxx.jpg'
