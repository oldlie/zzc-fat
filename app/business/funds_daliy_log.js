/**
 * Author: OLDLIE
 * DATE: 2021/3/1
 * 
 * 处理每天涨跌记录 
 */
const { ipcMain } = require('electron');
const { sqliteDB } = require('./sqlite_db');

/**
 * 记录或者更新某一天的的涨跌幅信息
 * 根据基金代码和日期来确定
 */
ipcMain.on('async-daliy-save', (event, args) => {
    let { code, ymd, amount } = args;
    const countSql = `SELECT COUNT(id) FROM f_daliy_log WHERE ymd=${ymd} AND funds_code=${code}`;
    sqliteDB.query(countSql)
        .then(row => {
            let existCount = row[0];
            if (existCount > 0) {
                // 更新
                const updateSql = `UPDATE f_daliy_log SET funds_amount=${amount} WHERE ymd=${ymd} AND funds_code=${code}`;
                sqliteDB.executeSql(updateSql).then(msg => event.reply('async-daliy-save-reply', '已更新'));
            } else {
                // 插入
                const insertSql = `INSERT INTO f_daliy_log (funds_code, ymd, y, m, d, funds_amount) values ($code, $ymd, $y, $m, $d, $amount)`;
                let y = Number(ymd.substr(0, 4));
                let m = Number(ymd.substr(4, 2));
                let d = Number(ymd.substr(6, 2));
                let data = { $code: code, $ymd: ymd, $y: y, $m: m, $d: d, $amount: amount };
                sqliteDB.insert(insertSql, data).then(id => event.reply('async-daliy-save-reply', '已保存'));
            }
        });
});

/**
 * 删除某一天某只基金的日志信息
 */
ipcMain.on('async-daliy-delete', (event, args) => {
    let {code, ymd} = args;
    const deleteSql = `DELETE FROM f_daliy_log WHERE ymd=${ymd} AND code=${code}`;
    sqliteDB.execute(deleteSql).then(msg => event.reply('async-daliy-delete-reply', "以删除"));
})