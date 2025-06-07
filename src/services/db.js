const mysql = require('mysql');

export const escape = mysql.escape

export const users = "Users"

export const foods = "Foods"
export const foodTags = "FoodTags"
export const foodTagRels = "FoodTagRels"

export const orders = "Orders"
export const suborders = "Suborders"

export const ordered = "'ordered'"
export const processing = "'processing'"
export const completed = "'completed'"

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export function runDBCommand(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results, fields) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}