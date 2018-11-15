const _ = require('underscore');
const { baseDir } = require('../config');
const path = require('path');
const db = require('../mysql');
const { spawn } = require('child_process');

function capture(originId, cheaterUId){
  let o = {
    'bf1statsShot': `http://bf1stats.com/pc/${originId}`,
    'trackerShot': `https://battlefieldtracker.com/bf1/profile/pc/${originId}`,
    'trackerWeaponShot': `https://battlefieldtracker.com/bf1/profile/pc/${originId}/weapons`,
  };
  _.each(o, (v, k, obj) => {

    console.log(`start to cpature ${v} ...`);

    let cp = spawn('node', [
      path.resolve(baseDir, 'libs/webshot.js'),
      v,
    ]);

    let url;
    cp.stdout.on('data', (data) => {
      url = data.toString();
    });
    cp.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    cp.on('close', (code) => {
      console.log(`cpature successfully ${k}, ${v}, ${url}`);

      // db.query(`update cheaters set ${k} = ? where uId = ?`, [url, cheaterUId]);
    })
  });
}

capture('fdisogf','62cd2164-3adf-4eaf-8891-e18ea9c5463b')
capture('dashuaibi807','66242b0a-8d4c-4cca-a384-161b44b7842c')
capture('gon-odyssey','fc6ccadc-dce2-4a9f-846e-1bd5392eab2c')
capture('fezyy','9c579e38-b48c-456f-82fd-d91f9007d01f')
capture('fa1rgotron','8f82c9eb-2182-4db9-823f-7a4f0986b91c')
