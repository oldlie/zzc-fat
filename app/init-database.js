/**
 * File: init-database.js
 * Author: oldlie
 * 
 */
const fs = require('fs');
const SqliteDB = require('./sqlite.js').SqliteDB;
const file = "funds.db";

function initDatabase() {

    const sqliteDB = new SqliteDB(file);

    /**
     * Funds basic information
     */
    const createFundsBasicInfoTable = `CREATE TABLE IF NOT EXISTS f_info(
funds_code CHAR(6) PRIMARY KEY, \
d INT, \
m INT, \ 
y INT, \ 
funds_title TEXT, \
funds_alias TEXT, \
init_amount BIGINT,
current_amount BIGINT \
)`;

    sqliteDB.createTable(createFundsBasicInfoTable);

    /**
     * Funds operation:
     * operation:买入，卖出，分红,差额,涨跌
     * opt_amount:本次操作花费的金额
     */
    const createFundsOperationTable = `CREATE TABLE IF NOT EXISTS f_operation(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
d INT, \
m INT, \
y INT, \
operation INT, \
funds_code CHAR(6), \
opt_amount BIGINT \
)`;

    sqliteDB.createTable(createFundsOperationTable);


    /**
     * Funds daliy log
     * funds_changes:每日金额涨跌变动(按支付宝的方式是包含手续费的)
     */
    const createFundsDaliyLogTable = `CREATE TABLE IF NOT EXISTS f_daliy_log(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
d INT, \
m INT, \
y INT, \
funds_code CHAR(6), \
funds_changs BITINT \
\)`;

    sqliteDB.createTable(createFundsDaliyLogTable);

    /**
     * Funds style pool
     */
    const createFundsStylePoolTable = `CREATE TABLE IF NOT EXISTS f_style_pool(id INTEGER PRIMARY KEY AUTOINCREMENT, s_title TEXT)`;
    sqliteDB.createTable(createFundsStylePoolTable);

    /**
     insert into f_style_pool (s_title) values ('医药');
     insert into f_style_pool (s_title) values ('新能源');
     insert into f_style_pool (s_title) values ('新能源汽车');
     insert into f_style_pool (s_title) values ('信息技术');
     insert into f_style_pool (s_title) values ('5G');
     insert into f_style_pool (s_title) values ('国防军工');
     insert into f_style_pool (s_title) values ('沪港深');
     insert into f_style_pool (s_title) values ('互联网');
     insert into f_style_pool (s_title) values ('互联网国际');
     insert into f_style_pool (s_title) values ('债券');
     insert into f_style_pool (s_title) values ('中小盘');
     insert into f_style_pool (s_title) values ('创新');
     insert into f_style_pool (s_title) values ('食品饮料');
     insert into f_style_pool (s_title) values ('指数');
     */

    /**
     * Funds style
     */
    const createFundsStyleTable = `CREATE TABLE IF NOT EXISTS f_style(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
funds_code CHAR(6), \
s_id INTEGER, \
s_title TEXT \
)`;
    sqliteDB.createTable(createFundsStyleTable);

};

exports.initDatabase = () => {
    if (!fs.existsSync(fs)) {
        initDatabase();
    }
}