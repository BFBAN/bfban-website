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

module.exports = {
  getCheatersDB,
};
