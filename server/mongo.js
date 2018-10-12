const mongoose = require('mongoose');
const config = require('./config');

const {
  dbuser, dbpassword, dbhost, dbname,
} = config.mongo;

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb://${dbuser}:${dbpassword}@${dbhost}/${dbname}`, { useNewUrlParser: true });
const mongoConnection = mongoose.connection;

module.exports = {
  mongoConnection,
};
