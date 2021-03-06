var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
require('dotenv').config();
require('events').EventEmitter.prototype._maxListeners = 100;
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
mongoose.Promise = global.Promise;
app.db = mongoose.connect(process.env.MLAB_URL, { useNewUrlParser: true, useUnifiedTopology: true});
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(
  sassMiddleware({
      src: __dirname + '/scss'
    , dest: path.join(__dirname, '/public/stylesheets')
    , debug: true
    , outputStyle: 'compressed'
    , prefix:  '/stylesheets'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/> 
  })
);
app.cloudinary = cloudinary;
app.models = {};
app.models['Users'] = mongoose.model('Users', require('./models/Users')); 
app.models['Quote'] = mongoose.model('Quote', require('./models/Quote')); 
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes(app));
// app.use('/users', users);

app.all('/*', function(req, res) {
    res.sendFile('index.html', { root: path.join(__dirname, '/public') });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
