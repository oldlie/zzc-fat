/**
 * Author: OLDLIE
 * DATE: 2021/2/28
 * 
 * 基本信息业务逻辑
 */
const { ipcMain } = require('electron')
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
    console.log(args);
    const sql = `insert into f_info (funds_code, d, y, m, funds_title, funds_alias, init_amount, current_amount) values (?,?,?,?,?,?,?,?)`;
    let now = new Date();
    let d = now.getDate();
    let m = now.getMonth() + 1;
    let y = now.getFullYear();
    let amount = args['amount'];
    if (amount.indexOf('.') >= 0) {
        amount = amount.replace('.', '');
    } else {
        amount = amount + '00';
    }
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
});

/**
 * 获取基金基本信息列表：
 * 1. 获取基金的基本信息；
 * 2. 获取每个基金最近5个交易日的涨跌信息；
 */
ipcMain.on('async-info', (event) => {
    const sql = `SELECT funds_code,funds_alias,current_amount FROM f_info`;
    sqliteDB.query(sql)
        .then(rows => {
            let data = [];
            for (let key in rows) {
                let item = rows[key];
                data.push({
                    code: item['funds_code'],
                    alias: item['funds_alias'],
                    amount: item['current_amount']
                });
            }
            //event.reply('async-info-reply', data);
            return data;
        })
        .then(data => {
             let pr = [];
             for (let index in data) {
                 let sql = `SELECT funds_code,funds_change FROM f_daliy_log WHERE funds_code='${data[index]['code']}' ORDER BY y,m,d DESC LIMIT 5`;
                 pr.push(sqliteDB.query(sql));
             }
            Promise.all(pr)
                .then(reuslt => {
                    event.reply('async-info-reply', data, reuslt);
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err))
});