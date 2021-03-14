const SqliteDB = require('../sqlite.js').SqliteDB;
const sqliteDB = new SqliteDB('funds.db');
const response = {
    status: 0,
    msg: ''
};

module.exports = { sqliteDB, response };
