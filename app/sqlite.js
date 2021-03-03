/**
 * File: sqlite.js.
 * Author: W A P.
 * Email: 610585613@qq.com.
 * Datetime: 2018/07/24.
 */

const fs = require('fs');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();

let DB = {};

DB.SqliteDB = function (file) {
    DB.db = new sqlite3.Database(file);

    DB.exist = fs.existsSync(file);
    if (!DB.exist) {
        console.log("Creating db file!");
        fs.openSync(file, 'w');
    };
};

DB.printErrorInfo = function (err) {
    console.log("Error Message:" + err.message + " ErrorNumber:" + errno);
};

DB.SqliteDB.prototype.createTable = function (sql) {
    DB.db.serialize(function () {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err);
                return;
            }
        });
    });
};

DB.SqliteDB.prototype.insert = function (sql, objects) {
    return new Promise((resolve, reject) => {
        DB.db.serialize(function () {
            var stmt = DB.db.prepare(sql);
            stmt.run(objects);
            stmt.finalize();
            DB.db.get('select last_insert_rowid();', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                for (let key in row) {
                    if (!row.hasOwnProperty(key)) {
                        continue;
                    }
                    console.log(key, row[key]);
                }
                resolve(row['last_insert_rowid()']);
            });
        });
    });
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function (sql, objects) {
    return new Promise((resolve, reject) => {
        DB.db.serialize(function () {
            var stmt = DB.db.prepare(sql);
            for (var i = 0; i < objects.length; ++i) {
                stmt.run(objects[i]);
            }
            stmt.finalize();
            resolve('done');
        });
    });
};

DB.SqliteDB.prototype.queryData = function (sql, callback) {
    DB.db.all(sql, function (err, rows) {
        if (null != err) {
            DB.printErrorInfo(err);
            return;
        }

        /// deal query data.
        if (callback) {
            callback(rows);
        }
    });
};

DB.SqliteDB.prototype.executeSql = function (sql) {
    DB.db.run(sql, function (err) {
        if (null != err) {
            DB.printErrorInfo(err);
        }
    });
};

DB.SqliteDB.prototype.execute = function (sql) {
    return new Promise((resolve, reject) => {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err);
                reject(err);
                return;
            }
            resolve('done.');
        });
    });
}

DB.SqliteDB.prototype.query = (sql) => {
    return new Promise((resolve, reject) => {
        DB.db.all(sql, function (err, rows) {
            if (null != err) {
                DB.printErrorInfo(err);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

DB.SqliteDB.prototype.close = function () {
    DB.db.close();
};

/// export SqliteDB.
exports.SqliteDB = DB.SqliteDB;