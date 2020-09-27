import express from 'express';
import fs from 'fs';
import createError, { HttpError } from 'http-errors';
var md5 = require('md5');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var router = express.Router();

var app = express();
var usedWordMemoryMap = new Map();

var translate = (id: string) => {
  const dictionary: { [key: string]: string } = {
    '0': 'g',
    '1': 'h',
    '2': 'i',
    '3': 'j',
    '4': 'k',
    '5': 'm',
    '6': 'n',
    '7': 'p',
    '8': 'q',
    '9': 'r',
  };
  for (var num in dictionary) {
    id = id.split(num).join(dictionary[num]);
  }
  return id;
};

router.get('/wordList', (__: express.Request, res: express.Response) => {
  const data = fs.readFileSync(__dirname + '/../../aux/word_list.yaml', 'utf8');
  res.send(data);
});

router.post('/save', (req: express.Request, res: express.Response) => {
  const id = md5(JSON.stringify(req.body)).substring(0, 4);
  usedWordMemoryMap.set(id, req.body);
  res.send(translate(id));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function (__, ___, next) {
  next(createError(404));
});

app.use(function (err: HttpError, req: express.Request, res: express.Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
