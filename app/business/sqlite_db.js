const SqliteDB = require('../sqlite.js').SqliteDB;
const sqliteDB = new SqliteDB('funds.db');

module.exports = { sqliteDB };
