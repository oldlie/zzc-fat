/**
 * Author: OLDLIE
 * DATE: 2021/2/28
 * 
 * 基本信息业务逻辑
 */
const { ipcMain, autoUpdater } = require('electron')
const { sqliteDB } = require('./sqlite_db')


/**
 * 接收加载基金风格信息事件，并发送一个包含风格列表的返回事件
 */
ipcMain.on('async-load-style-pool', (event) => {
    const sql = `select id,s_title from f_style_pool order by id asc`;
    sqliteDB.query(sql).then(rows => {
        let r = [];
        for (let i in rows) {
            let item = rows[i];
            r.push({ id: item['id'], title: item['s_title'] });
        }
        event.reply('async-load-style-pool-reply', r)
    });
})

/**
 * 接收保存基金基本信息事件：
 * 1，保存基金的基本信息；
 * 2，保存基金的风格到关联表，基本信息和风格是一对多的关系；
 */
ipcMain.on('async-save-basic-info', (event, args) => {

    let { code, title, alias, amount, style } = args;

    let now = new Date();
    let d = now.getDate();
    let m = now.getMonth() + 1;
    let y = now.getFullYear();
    amount = Number(amount) * 100;

    const sql2 = `SELECT COUNT(funds_code) as c FROM f_info WHERE funds_code='${code}';`;
    sqliteDB.query(sql2).then(rows => {
        let count = rows[0]['c'];
        if (count > 0) {
            const sql = `UPDATE f_info SET \
            funds_title='${title}', funds_alias='${alias}', init_amount=${amount}, current_amount=${amount} \
            WHERE funds_code='${code}';`;
            let pr = sqliteDB.query(sql);
            const sql2 = `DELETE FROM f_style WHERE funds_code='${code}';`;
            sqliteDB.query(sql2).then(rows => {
                console.log('delete==>', rows);
                const sql3 = `insert into f_style (funds_code, s_id) values ($code, $sid)`;
                let data2 = [];
                for (let i = 0; i < style.length; i++) {
                    let item = style[i];
                    data2.push({
                        "$code": code,
                        "$sid": item
                    });
                };
                let pr1 = sqliteDB.insertData(sql3, data2);
                Promise.all([pr, pr1]).then(value => {
                    console.log('value', value);
                    event.reply('async-save-basic-info-reply', value)
                }).catch(err => console.log(err));
            })
        } else {
            const sql = `insert into f_info (funds_code, d, y, m, funds_title, funds_alias, init_amount, current_amount) values (?,?,?,?,?,?,?,?)`;
            let data = [
                args['code'], d, y, m, args['title'], args['alias'], amount, amount
            ];
            sqliteDB.insert(sql, data)
                .then(id => {
                    console.log(args['style']);
                    let list = args['style'];
                    if (!(list instanceof Array)) {
                        throw '基金风格应该是数组';
                    }
                    const sql2 = `insert into f_style (funds_code, s_id) values ($code, $sid)`;
                    let data2 = [];
                    for (let i = 0; i < list.length; i++) {
                        let item = list[i];
                        data2.push({
                            "$code": args['code'],
                            "$sid": item
                        });
                    }
                    sqliteDB.insertData(sql2, data2).then(msg => {
                        event.reply('async-save-basic-info-reply', id)
                    });
                })
                .catch(err => console.log(err));
        }
    });
});

/**
 * 获取基金基本信息列表：
 * 1. 获取基金的基本信息；
 * 2. 获取每个基金最近5个交易日的涨跌信息；
 */
ipcMain.on('async-info', (event) => {
    const sql = `SELECT funds_code,funds_alias,current_amount FROM f_info ORDER BY funds_code ASC;`;
    sqliteDB.query(sql)
        .then(rows => {
            let data = [];
            for (let key in rows) {
                let item = rows[key];
                let amount = `${item['current_amount']}`;
                if (amount !== '0') {
                    let length = amount.length - 2;
                    amount = `${amount.substring(0, length)}.${amount.substring(length)}`;
                }

                console.log('amount--->', amount);
                data.push({
                    code: item['funds_code'],
                    alias: item['funds_alias'],
                    amount: amount
                });
            }
            //event.reply('async-info-reply', data);
            return data;
        })
        .then(data => {
            let pr = [];
            for (let index in data) {
                let sql = `SELECT funds_code,funds_amount,ymd FROM f_daliy_log WHERE funds_code='${data[index]['code']}' ORDER BY ymd DESC LIMIT 5`;
                pr.push(sqliteDB.query(sql));
            }
            Promise.all(pr)
                .then(result => {
                    console.log('result ===>', result);
                    event.reply('async-info-reply', data, result);
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});

/**
 * 根据code获取一条基金的基本信息
 */
ipcMain.on('async-basic-info', (event, args) => {
    const { code } = args;
    const sql = `SELECT * FROM f_info WHERE funds_code='${code}'`;
    const result = {
        status: 0,
        data: {}
    };
    sqliteDB.query(sql)
        .then(rows => {
            const data = rows[0];
            return {
                code: data['funds_code'],
                title: data['funds_title'],
                alias: data['funds_alias'],
                amount: data['init_amount']
            }
        })
        .then(data => {
            const sql2 = `SELECT s_id as sid FROM f_style WHERE funds_code='${data['code']}'`;
            sqliteDB.query(sql2)
                .then(rows => {
                    data['styles'] = rows.map(x => x['sid']);
                    result.data = data;
                    event.reply('async-basic-info-reply', result);
                })
                .catch(err => {
                    result.status = 1;
                    result.data = err;
                    event.reply('async-basic-info-reply', result);
                })
        })
        .catch(err => {
            result.status = 1;
            result.data = err;
            event.reply('async-basic-info-reply', result);
        })
});

/**
 * 根据code删除一套基金的基本信息
 * 凡是有funds_code字段的表都要删除
 */
ipcMain.on('async-basic-info-delete', (event, args) => {
    const { code } = args;
    const tables = ['f_info', 'f_opeartion', 'f_daliy_log', 'f_month_log', 'f_year_log', 'f_style'];
    let prs = [];
    let result = {
        status: 0,
        message: 'success'
    };
    for (let index in tables) {
        prs.push(sqliteDB.query(`DELETE FROM ${tables[index]} WHERE funds_code='${code}';`));
    }
    Promise.all(prs)
        .then((rows) => {
            console.log(rows);
            event.reply('async-basic-info-delete-reply', result);
        })
        .catch(err => {
            result.message = err;
            event.reply('async-basic-info-delete-reply', result)
        });
})