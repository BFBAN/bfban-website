const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const pino = require('pino')({
  prettyPrint: {
    colorize: true,
    translateTime: true,
  },
});

const routes = require('./routes/');
const config = require('./config');

const { port, address } = config;

// redis client
// const redisClient = require('./redis');

// session
// const session = require('express-session');
// const RedisStore = require('connect-redis')(session)

// create express app
const app = express();

// cors
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

app.use(cookieParser(config.secret, {
  httpOnly: true,
}));

// redis session
// const redisOpts = {
//     client: redisClient,
//     // Redis session TTL (expiration) in seconds. Defaults to session.cookie.maxAge (if set), or one day.
//     // ttl: 60 * 60 * 12,
// }
// app.use(session({
//   secret: config.secret,
//   resave: false,
//
//   cookie: {
//     secure: false, // https or not
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 12, // default one day
//   },
//
//   // deprecated
//   saveUninitialized: true,
//   // default express-session will use memoryStore
//   // store: new RedisStore(redisOpts),
// }));


// middlewares

// morgan logger
app.use(morgan(':date[clf] :status :method :url :res[content-length] :response-time ms  :remote-addr', {
  // skip(req, res) { return res.statusCode < 400; },
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set views and view engine
// app.set('views', path.resolve(config.baseDir, 'views'));
// app.set('view engine', 'ejs');

// set static
app.use('/', express.static(path.resolve(config.baseDir, 'public')));

// routes
app.use('/api', routes);

// 404
app.use((req, res, next) => res.sendStatus(404));

// csrf error handler
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  // handle CSRF token errors here
  res.status(403);
  return res.json({
    error: 1,
    msg: 'ForbiddenError: invalid request',
  });
});

// error handling
app.use((err, req, res, next) => {
  pino.error(err.stack);
});

// https://thecodebarbarian.com/unhandled-promise-rejections-in-node.js.html
process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});


// mongoConnection.on('error', console.error.bind(console, 'mongodb connection error!!'));
// mongoConnection.once('open', () => {
//   // db connected
//   console.log('mongodb connected...');

//   // app start
//   app.listen(port, () => console.log(`app listen on port ${port}...`));
// });


if (!module.parent) {
  // app start
  app.listen(port, address, () => console.log(`app listen on address ${address} port ${port}...`));
}

module.exports = app;
