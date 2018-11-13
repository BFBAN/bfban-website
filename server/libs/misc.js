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

module.exports = {
  gamesArr,
  getCheatersDB,
  getDatetime,
  getDatetimeWithTZ,
};
