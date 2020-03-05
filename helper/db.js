const mysql = require('mysql');

module.exports =  () => {
    let dbConnection = mysql.createConnection({
         host     : 'localhost',
         user     : 'root',
         password : '',
         database : 'application'
    });
    dbConnection.connect((err) => {
        if (err) throw err;
        console.log('Databese e bağlantı başarılı');
    });

    let sqlSorgusu = `CREATE TABLE IF NOT EXISTS kisiler (
  kisi_sira INT AUTO_INCREMENT NOT NULL,
  kisi_adi VARCHAR(20) NOT NULL,
  kisi_soyadi VARCHAR(30) NOT NULL DEFAULT 'SEZER',
  kisi_eposta VARCHAR(50) NOT NULL,
  CONSTRAINT PK_sira PRIMARY KEY(kisi_sira)
);`;
    dbConnection.state;

    };

