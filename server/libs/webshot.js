const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

const tmpDir = os.tmpdir();
const tmpFileName = `${(new Date()).getTime()  }-${  Math.floor(Math.random() * 10000)  }.jpg`;
const tmpFileLocation = path.resolve(tmpDir, tmpFileName);

async function webshot(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1220, height: 768 });
  await page.screenshot({ path: tmpFileLocation, fullPage: true, quality: 30 });

  await browser.close();
}

function uploadToSm(url) {
  return new Promise(async (resolve, reject) => {
    await webshot(url);

    const data = new FormData();
    data.append('smfile', fs.createReadStream(tmpFileLocation));

    // Send multipart/form-data with axios in nodejs
    // https://github.com/axios/axios/issues/1006#issuecomment-320165427
    await axios({
      method: 'post',
      url: 'https://sm.ms/api/upload',
      headers: data.getHeaders(),
      data,
    })
      .then((res) => res.data)
      .then((d) => d.data)
      .then((d) => {
        resolve(d.url);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function checkGameIdExist(id) {
  const baseUrl = 'http://bf1stats.com/search?q=';

  return new Promise(async (resolve, reject) => {
    try {
      await axios({
        method: 'post',
        url: baseUrl + id,
        data: {
          request: 'loadResults',
        },
      })
        .then((res) => {
          const d = res.data;
          let status;

          try {
            status = d.locals.searchResults[0].status;
            if (status === 'done') {
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (e) {
            resolve(false);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

// checkGameIdExist('fxodof3ts23edfsr')
// .then((isExist) => {
//   console.log(isExist)
// })

// http://bf1stats.com/pc/
// https://battlefieldtracker.com/bf1/profile/pc/
// uploadToSm('http://bf1stats.com/pc/RealMichaelGin')
//   .then((url) => {
//     console.log(url);
//   });

if (process.argv.length && process.argv.length > 2) {
  let url = process.argv[2];
  uploadToSm(url)
  .then((u) => {
    console.log(u);
  });
}

module.exports = {
  uploadToSm,
  checkGameIdExist,
};
