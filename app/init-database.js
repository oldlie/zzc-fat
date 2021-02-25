/**
 * File: init-database.js
 * Author: oldlie
 * 
 */

const SqliteDB = require('./sqlite.js').SqliteDB;
const file = "funds.db";

const sqliteDB = new SqliteDB(file);

/**
 * Funds basic information
 */
const createFundsBasicInfoTable = `CREATE TABLE IF NOT EXISTS f_info(\
funds_code INT PRIMARY KEY \
d INT \
m INT \
y INT \
funds_title TEXT \
current_amount BIGINT \
)`;

sqliteDB.createTable(createFundsBasicInfoTable);

/**
 * Funds operation:
 * operation:买入，卖出，分红
 */
const createFundsOperationTable = `CREATE TABLE IF NOT EXISTS f_operation(\
    id INTEGER AUTOINCREMENT PRIMARY KEY \
    d INT \
    m INT \
    y INT \
    operation INT \
    funds_code INT \
    opt_amount BIGINT \
)`

sqliteDB.createTable(createFundsOperationTable);


/**
 * Funds daliy log
 */
const createFundsDaliyLogTable = `CREATE TABLE IF NOT EXISTS f_daliy_log(\
    id INTEGER AUTOINCREMENT PRIMARY KEY \
    d INT \
    m INT \
    y INT \
    funds_code INT \
    funds_
    \)`