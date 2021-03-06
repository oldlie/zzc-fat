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
     * funds_changes:每日金额涨跌幅度
     * funds_cal: 根据幅度的计算值
     * funds_fixed: 手动录入的修正值(默认填写计算值)
     * funds_amount: 今日基金金额（f_info.current_amount + f_daliy_log.funds_fixed）
     */
    const createFundsDaliyLogTable = `CREATE TABLE IF NOT EXISTS f_daliy_log(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
ymd INT, \
d INT, \
m INT, \
y INT, \
funds_code CHAR(6), \
funds_change BIGINT, \
funds_cal BIGINT, \
funds_fixed BIGINT, \
funds_amount BIGINT \
)`;

    sqliteDB.createTable(createFundsDaliyLogTable);

    /**
     * Funds month log
     */
    const createFundsMonthLogTable = `CREATE TABLE IF NOT EXISTS f_month_log(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
ym INT, \
funds_code CHAR(6), \
funds_amount BIGINT \
)`;
    
    sqliteDB.createTable(createFundsMonthLogTable);

    /**
     * Funds year log
     */
    const createFundsYearLogTable = `CREATE TABLE IF NOT EXISTS f_year_log(\
id INTEGER PRIMARY KEY AUTOINCREMENT, \
y INT, \
funds_code CHAR(6), \
funds_amount BIGINT \
)`;
    
    sqliteDB.createTable(createFundsYearLogTable);


    /**
     * Funds style pool
     */
    const createFundsStylePoolTable = `CREATE TABLE IF NOT EXISTS f_style_pool(id INTEGER PRIMARY KEY AUTOINCREMENT, s_title TEXT)`;
    sqliteDB.createTable(createFundsStylePoolTable);

    const data = [
        ['医药'],['新能源'],['新能源汽车'],['信息技术'],['5G'],
        ['国防军工'],
        ['沪港深'],
        ['互联网'],
        ['互联网国际'],
        ['债券'],
        ['中小盘'],
        ['创新'],
        ['食品饮料'],
        ['指数']
    ];
    const sql = `INSERT INTO f_style_pool (s_title) values (?)`;
    sqliteDB.insertData(sql, data);

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
    if (!fs.existsSync(file)) {
        initDatabase();
    }
}