const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

//const db = require('./helper/db')();
const mysql = require('mysql');
const app = express();


let dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'application'
});


let sql_kisiler = `CREATE TABLE IF NOT EXISTS kisiler (
  kisi_sira INT AUTO_INCREMENT NOT NULL,
  kisi_adi VARCHAR(20) NOT NULL,
  kisi_soyadi VARCHAR(30) NOT NULL,
  CONSTRAINT PK_sira PRIMARY KEY(kisi_sira)
);`;

let sql_etkinlik = `CREATE TABLE IF NOT EXISTS etkinlik (
    etkinlik_tarihi date NOT NULL,
    yazar_id VARCHAR(20) NOT NULL
    
)`;
function sorgu_ileti(x,y=undefined){ dbConnection.connect((err) => {
  if (err) throw err;
  dbConnection.query(x,y,(err,results)=> {
    if (err) throw err.message;
    console.log('İleti Gerçekleştirildi.');
  });


});};
let kisi_ekle = `INSERT INTO kisiler values(NULL ,?,?)`;
let kisiler_ekle = `INSERT INTO kisiler(kisi_adi,kisi_soyadi) values ?`
let admin_kisi = ['Ahmet','Yılmaz'];

sorgu_ileti(kisiler_ekle,kisiler);



dbConnection.state;















// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
