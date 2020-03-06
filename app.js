const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');

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

/////////LOGİN////////////////////////
const ifLoggedin = (req,res,next) => {
  if(req.session.isLoggedIn){
    return res.redirect('/anasayfa');
  }
  next();
};
app.post('/', ifLoggedin, [
  (req) => {
    return dbConnection.execute('SELECT `email` FROM `login` WHERE `email`=?', [req.query.email])
        .then(([rows]) => {
          if(rows.length == 1){
            return true;

          }
          return Promise.reject('Geçersiz email.');

        });
  },
  req.query.email.trim().not().isEmpty(),
], (req, res) => {
  const validation_result = validationResult(req);
  const {password, user_name} = {req.password, req.email};
  if(validation_result.isEmpty()){

    dbConnection.execute("SELECT * FROM `login` WHERE `email`=?",[email])
        .then(([rows]) => {
          bcrypt.compare(user_pass, rows[0].password).then(compare_result => {
            if(compare_result === true){
              req.session.isLoggedIn = true;
              req.session.userID = rows[0].id;

              res.redirect('/');
            }
            else{
              res.redirect('/login',{
                login_errors:['Şifre Hatalı']
              });
            }
          })
              .catch(err => {
                if (err) throw err;
              });


        }).catch(err => {
      if (err) throw err;
    });
  }
  else{
    let allErrors = validation_result.errors.map((error) => {
      return error.msg;
    });
    res.send('/login',{
      login_errors:allErrors
    });
  }
});



////////APLİCATİON///////////////////

let sql_kisiler = `CREATE TABLE IF NOT EXISTS kisiler (
  kisi_sira INT AUTO_INCREMENT NOT NULL,
  kisi_adi VARCHAR(20) NOT NULL,
  kisi_soyadi VARCHAR(30) NOT NULL,
  CONSTRAINT PK_sira PRIMARY KEY(kisi_sira)
);`;

let sql_etkinlik = `CREATE TABLE IF NOT EXISTS etkinlik (
    etkinlik_tarihi date NOT NULL,
    yazar_id VARCHAR(20) NOT NULL
);ALTER TABLE \`etkinlik\` ADD \`etkinlik_adi\` VARCHAR(20) NOT NULL AFTER \`etkinlik_tarihi\`;
ALTER TABLE \`etkinlik\` ADD \`Katılımcilar\` JSON NOT NULL AFTER \`yazar_id\`;
`;
function sorgu_ileti(x,y=undefined){ dbConnection.connect((err) => {
  if (err) throw err;
  dbConnection.query(x,y,(err,results)=> {
    if (err) throw err.message;
    console.log('İleti Gerçekleştirildi.');
  });


});};
let kisi_ekle = `INSERT INTO kisiler values(NULL ,?,?)`;
let kisiler_ekle = `INSERT INTO kisiler(kisi_adi,kisi_soyadi) values ?`


//sorgu_ileti(kisiler_ekle,kisiler);

app.get('/kullanici-list',(req,res) => {
  fs.readFile('./helper/jdb_kullanici.json','utf8',(err,data)=>{
    res.send(data);
  })
 });

app.get('/kullanici-ekle',(req,res) => {
  fs.readFile('./helper/jdb_kullanici.json','utf8',(err,data)=>{
    data = JSON.parse(data);
    let  yeni_kullanici = {
      "5" : {
          "ad" : req.query.ad,
          "soyad" :   req.query.soyad }
    }
    data["5"] = yeni_kullanici["5"];
    res.send(JSON.stringify(data));
    fs.writeFile('./helper/jdb_kullanici.json',JSON.stringify(data),(err) => {
      console.log('jdb_kullanici.json dosyasına yazarken bir hata oluştu.')
    })
  })
});

app.get('/etkinlik-ekle',(req,res) => {
  fs.readFile('./helper/jdb_etkinlik.json','utf8',(err,data)=>{
    data = JSON.parse(data);
    data1 = fs.readFile('./helper/jdb_kullanici.json',(err,data) => {
      return JSON.stringify(data);
    } )
    let  yeni_etkinlik = {
      "2020-03-06" : {
        "etkinlik_adı" : req.query.etkinlik_adı,
        "yazar_id" :   req.query.yazar_id,
        "katılımcilar": data1 }
    }
    data["2020-03-06"] = yeni_etkinlik["2020-03-06"];
    res.send(JSON.stringify(data));
    fs.writeFile('./helper/jdb_etkinlik.json',JSON.stringify(data),(err) => {
      console.log('jdb_kullanici.json dosyasına yazarken bir hata oluştu.')
    })
  })
});



dbConnection.state;















let server = app.listen(701,() => {
  console.log('server aktif');
})


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


  res.status(err.status || 500);
  res.send('error');
});


module.exports = app;
