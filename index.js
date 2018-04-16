const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');

const db = require('./config/db').url;

/**
 * Controllers (route handlers).
 */
const authController = require('./controllers/auth');
const notesController = require('./controllers/notes');

/**
 * Configs and constants.
 */
const passportConfig = require('./config/passport');

const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(db);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/*
 * Express Configurations
 */
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8000);
app.set('MONGODB_URI', process.env.MONGODB_URI || db);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'gitter',
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: db,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());

/**
 * Primary app routes.
 */
app.get('/users/:id', authController.getUser);
app.get('/note/:id', notesController.getNote);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized);
app.post('/api/local/signup', authController.postSignup);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
