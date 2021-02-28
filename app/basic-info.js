/**
 * 基本信息业务逻辑
 */
const { ipcMain } = require('electron')

const SqliteDB = require('./sqlite.js').SqliteDB;
const sqliteDB = new SqliteDB('funds.db');

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

ipcMain.on('async-save-basic-info', (event, args) => {
    console.log(args);
    const sql = `insert into f_info (funds_code, d, y, m, funds_title, funds_alias, init_amount, current_amount) values (?,?,?,?,?,?,?,?)`;
    let now = new Date();
    let d = now.getDate();
    let m = now.getMonth() + 1;
    let y = now.getFullYear();
    let data = [
        args['code'], d, y, m, args['title'], args['alias'], args['amount'], args['amount']
    ];
    // event.reply('async-save-basic-info-reply', id)
    sqliteDB.insert(sql, data)
    .then(id => {
        let list = args['style'].split(',');
        const sql2 = `insert into f_style (funds_code, s_id) values ($code, $sid)`;
        let data2 = [];
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            data2.push({
                "$code": id,
                "$sid": item
            });
        }
        sqliteDB.insertData(sql2, data2).then(msg => {
            event.reply('async-save-basic-info-reply', id)
        });
    })
    .catch(err => console.log(err));
});