const moment = require('moment');

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

module.exports = {
  gamesArr,
  getCheatersDB,
  getDatetime,
  getDatetimeWithTZ,
  addOneDay,
  convertDatetimeToTimeZone,
};
