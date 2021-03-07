/**
 * Author: OLDLIE
 * DATE: 2021/3/1
 * 
 * 处理每天涨跌记录 
 */
const { ipcMain } = require('electron');
const { sqliteDB } = require('./sqlite_db');

const response = {
    status: 0,
    msg: ''
};

/**
 * 记录或者更新某一天的的涨跌幅信息
 * 根据基金代码和日期来确定
 */
ipcMain.on('async-daliy-save', (event, args) => {
    let { code, ymd, amount } = args;

    if (amount.indexOf('.') > 0) {
        amount = amount.replace('.', '');
    } else {
        amount = amount + '00';
    }

    const countSql = `SELECT COUNT(id) as c FROM f_daliy_log WHERE ymd=${ymd} AND funds_code='${code}';`;
    try {

        sqliteDB.query(countSql)
            .then(row => {
                let existCount = row[0];
                if (existCount.c > 0) {
                    // 更新
                    const updateSql = `UPDATE f_daliy_log SET funds_amount=${amount} WHERE ymd=${ymd} AND funds_code='${code}'`;
                    sqliteDB.execute(updateSql)
                    .then(msg => event.reply('async-daliy-save-reply', msg))
                    .catch(err => console.log('save', err))
                    .finally(() => calculateAll(ymd));
                } else {
                    // 插入
                    const insertSql = `INSERT INTO f_daliy_log (funds_code, ymd, y, m, d, funds_amount) values ($code, $ymd, $y, $m, $d, $amount)`;
                    let y = Number(ymd.substr(0, 4));
                    let m = Number(ymd.substr(4, 2));
                    let d = Number(ymd.substr(6, 2));
                    let data = { $code: code, $ymd: ymd, $y: y, $m: m, $d: d, $amount: amount };
                    sqliteDB.insert(insertSql, data)
                    .then(id => event.reply('async-daliy-save-reply', id))
                    .catch(err => console.log('save2', err))
                    .finally(() => calculateAll(ymd));
                }
            });

    } catch (err) {
        console.log(err)
    }
});

const f_999999 = '999999';

function calculateAll(ymd) {
    console.log('ymd total==>', ymd);
    const sql = `SELECT SUM(funds_amount) AS v FROM f_daliy_log WHERE ymd=${ymd} AND funds_code != ${f_999999}`;
    sqliteDB.query(sql)
        .then(rows => {
            let sum = rows[0];
            console.log('sum without 999999', sum.v);
            return sum.v;
        })
        .then(sum => {
            const sql1 = `SELECT COUNT(funds_code) as v FROM f_daliy_log WHERE funds_code=${f_999999} AND ymd=${ymd}`;
            sqliteDB.query(sql1)
                .then(rows => {
                    let count = rows[0];
                    if (count.v > 0) {
                        const sql2 = `UPDATE f_daliy_log SET funds_amount = ${sum} WHERE funds_code=${f_999999} AND ymd=${ymd}`;
                        sqliteDB.executeSql(sql2);
                    } else {
                        const sql3 = `INSERT INTO f_daliy_log (funds_code, ymd, y, m, d, funds_amount) values ($code, $ymd, $y, $m, $d, $amount)`;
                        let y = Number(ymd.substr(0, 4));
                        let m = Number(ymd.substr(4, 2));
                        let d = Number(ymd.substr(6, 2));
                        let data = { $code: f_999999, $ymd: ymd, $y: y, $m: m, $d: d, $amount: sum };
                        sqliteDB.insert(sql3, data);
                    }
                })
                .catch(err => console.log('calculateAll:', err));
        })
        .catch(err => console.log('calculateAll2', err));

}

/**
 * 删除某一天某只基金的日志信息
 */
ipcMain.on('async-daliy-delete', (event, args) => {
    let { code, ymd } = args;
    const deleteSql = `DELETE FROM f_daliy_log WHERE ymd=${ymd} AND code=${code}`;
    sqliteDB.execute(deleteSql).then(msg => event.reply('async-daliy-delete-reply', "以删除"));
})

/**
 * 计算所有基金某一天的收益
 */
ipcMain.on('async-calculate-all', (event, args) => {
    const { ymd } = args;
    const sql = `SELECT sum(funds_amount) as v FROM f_daliy_log WHERE ymd=${ymd} AND funds_code!=${f_999999};`;
    const result = {
        status: 0,
        message: 'success'
    };
    sqliteDB.query(sql).then(rows => {
        result['data'] = rows[0].v;
        event.reply('async-calculate-all-reply', result);
    })
        .catch(err => {
            result.message = err;
            event.reply('async-calculate-all-reply', result);
        })
});

/**
 * 提供基金日历需要的数据
 */
ipcMain.on('async-daliy-list', (event, args) => {
    let { code, ymd} = args;
    let year = Number(`${ymd}`.substr(0, 4));
    let month = Number(`${ymd}`.substr(4, 2));
    const sql = `SELECT funds_amount as 'amount', ymd as 'date' FROM f_daliy_log WHERE funds_code='${code}' AND y=${year} AND m=${month}`;
    let pr = sqliteDB.query(sql);
    const sql1 = `SELECT funds_alias as 'alias' FROM f_info WHERE funds_code='${code}'`;
    let pr1 = sqliteDB.query(sql1);
    Promise.all([pr1, pr]).then(result => {
        console.log('xxxx===>', result);
        response['data'] = result;
        event.reply('async-daliy-list-reply', response);
    }).catch(err => {
        response.status = 1;
        response.message = err.message;
        event.reply('async-daliy-list-reply', response);
    });
});