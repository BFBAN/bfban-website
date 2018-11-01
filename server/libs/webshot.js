const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

let tmpDir = os.tmpdir();
let tmpFileName = (new Date()).getTime() + '-' + Math.floor(Math.random() * 10000) + '.jpg';
let tmpFileLocation = path.resolve(tmpDir, tmpFileName);

async function webshot(url) {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({width: 1220, height: 768});
  await page.screenshot({path: tmpFileLocation, fullPage: true, quality: 30});

  console.log(tmpFileLocation);

  await browser.close();
}

function uploadToSm(url) {
  return new Promise(async (resolve, reject) => {
    await webshot(url);

    let data = new FormData();
    data.append('smfile', fs.createReadStream(tmpFileLocation));

    // Send multipart/form-data with axios in nodejs
    // https://github.com/axios/axios/issues/1006#issuecomment-320165427
    await axios({
      method: 'post',
      url: 'https://sm.ms/api/upload',
      headers: data.getHeaders(),
      data,
    })
    .then((res) => {
      return res.data
    })
    .then(d=> {
      return d.data
    })
    .then((d)=> {
      resolve(d.url);
    })
    .catch(e => {
      reject(e);
    });
  })

}

function checkGameIdExist(id) {
  let baseUrl = 'http://bf1stats.com/search?q=';

  return new Promise(async (resolve, reject) => {
    try {
      await axios({
        method: 'post',
        url: baseUrl + id,
        data: {
          'request': 'loadResults'
        }
      })
      .then((res) => {
        let d = res.data;
        let status;

        try {
          status = d.locals.searchResults[0].status
          if (status === 'done') {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch(e) {
          resolve(false);
        }
      })
    } catch(e) {
      reject(e);
    }
  })
}

// checkGameIdExist('fxodof3ts23edfsr')
// .then((isExist) => {
//   console.log(isExist)
// })

// uploadToSm('https://battlefieldtracker.com/bf1/profile/pc/fxodof3ts23edfsr')
// .then(url=> {
//   console.log(url);
// })

module.exports = {
  uploadToSm,
  checkGameIdExist,
};
