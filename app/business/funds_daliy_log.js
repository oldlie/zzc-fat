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
    let { code, ymd, amount, logType } = args;

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
                    const insertSql = `INSERT INTO f_daliy_log (funds_code, ymd, y, m, d, funds_amount, log_type) values ($code, $ymd, $y, $m, $d, $amount, $logType)`;
                    let y = Number(ymd.substr(0, 4));
                    let m = Number(ymd.substr(4, 2));
                    let d = Number(ymd.substr(6, 2));
                    let data = { $code: code, $ymd: ymd, $y: y, $m: m, $d: d, $amount: amount, $logType: logType };
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
    let { code, ymd } = args;
    let year = Number(`${ymd}`.substr(0, 4));
    let month = Number(`${ymd}`.substr(4, 2));
    const sql = `SELECT funds_amount as 'amount', ymd as 'date' FROM f_daliy_log WHERE funds_code='${code}' AND y=${year} AND m=${month} AND log_type=0 ORDER BY ymd ASC`;
    let pr = sqliteDB.query(sql);
    const sql1 = `SELECT funds_alias as 'alias' FROM f_info WHERE funds_code='${code}'`;
    let pr1 = sqliteDB.query(sql1);
    let sql2 = `SELECT COUNT(id) as 'up' FROM f_daliy_log WHERE funds_code='${code}' AND y=${year} AND m=${month} AND funds_amount >= 0`;
    let pr2 = sqliteDB.query(sql2);
    let sql3 = `SELECT COUNT(id) as 'down' FROM f_daliy_log WHERE funds_code='${code}' AND y=${year} AND m=${month} AND funds_amount < 0`;
    let pr3 = sqliteDB.query(sql3);
    let sql4 = `SELECT SUM(funds_amount) as 'total' FROM f_daliy_log WHERE funds_code='${code}' AND y=${year} AND m=${month}`;
    let pr4 = sqliteDB.query(sql4);

    Promise.all([pr1, pr, pr2, pr3, pr4]).then(result => {
        console.log('xxxx===>', result);
        response['data'] = result;
        event.reply('async-daliy-list-reply', response);
    }).catch(err => {
        response.status = 1;
        response.message = err.message;
        event.reply('async-daliy-list-reply', response);
    });
});

/**
 * 按基金代码和时间范围选择
 */
ipcMain.on('async-daliy-list-by-code-and-date-range', (event, args) => {
    console.log('args', args);
    let { code, startYmd, endYmd, filterZero } = args;
    let sql;
    if (filterZero === "0") {
        sql = `SELECT ymd, y, m, funds_amount as 'amount' FROM f_daliy_log WHERE funds_code='${code}' AND ymd < ${endYmd} AND ymd >= ${startYmd} AND funds_amount != 0 ORDER BY ymd ASC`;
    } else {
        sql = `SELECT ymd, y, m, funds_amount as 'amount' FROM f_daliy_log WHERE funds_code='${code}' AND ymd < ${endYmd} AND ymd >= ${startYmd} ORDER BY ymd ASC`;
    }
    console.log('sql', sql);
    sqliteDB.query(sql)
        .then(rows => {
            console.log('daliy list code & date range', rows);
            response['data'] = rows;
            event.reply('async-daliy-list-by-code-and-date-range-reply', response);
        })
        .catch(err => {
            response.status = 1;
            response.msg = err.message;
        })
})