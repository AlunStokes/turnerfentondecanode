var config = require('./config');
var mysql = require("mysql2");

module.exports = {
  pool: mysql.createPool({
    connectionLimit: 1000,
    multipleStatements: true,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  })
}
