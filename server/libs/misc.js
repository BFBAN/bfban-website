const moment = require('moment');
const crypto = require('crypto');

function getCheatersDB(name) {
  let dbName;
  switch (name) {
    case 'bfv':
      dbName = 'bfv_cheaters';
      break;
    case 'bf4':
      dbName = 'bf4_cheaters';
      break;
    default:
      dbName = 'cheaters';
      break;
  }

  return dbName;
}

const gamesArr = ['bf1', 'bfv'];

function getDatetime() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function getDatetimeWithTZ(d) {
  return moment(d).format();
}

function addOneDay(str) {
  return moment(str).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
}

function convertDatetimeToTimeZone(d, tz) {
  return moment.tz(d, tz).clone().tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
}


const algorithm = 'aes-256-ctr';
function encrypt(text, s) {
  const cipher = crypto.createCipher(algorithm, s);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text, s) {
  const decipher = crypto.createDecipher(algorithm, s);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
  gamesArr,
  getCheatersDB,
  getDatetime,
  getDatetimeWithTZ,
  addOneDay,
  convertDatetimeToTimeZone,
  encrypt,
  decrypt,
};
