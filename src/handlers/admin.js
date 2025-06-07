import { now } from "../services/utils";

const db = require('../services/db')

export async function getAllOrder() {
    return await db.runDBCommand(`SELECT * FROM ${db.orders};`)
}

export async function getOnGoingOrders() {
    return await db.runDBCommand(`SELECT * FROM ${db.orders} WHERE CompletedOn IS NULL;`)
}

export async function forceCompleteOrder(id) {
    const result = await db.runDBCommand(`UPDATE ${db.orders} SET Status = ${db.completed}, CompletedOn = ${now()} WHERE Id = ${id};`)
    return result.affectedRows > 0
}

export async function getAllTags() {
    return await db.runDBCommand(`SELECT * FROM ${db.foodTags};`)
}

export async function addTag(tag, colourHex) {
    const result = await db.runDBCommand(`INSERT INTO ${db.foodTags} (Name, Colour) VALUES ('${db.escape(tag)}', '${db.escape(colourHex)}')`)
    return result.affectedRows > 0
}

export async function addFood(name, description, time, veg, tags) {
    const result = await db.runDBCommand(`INSERT INTO ${db.foods} (Name, Description, Time, Veg) VALUES ('${db.escape(name)}', '${db.escape(description)}', '${db.escape(time)}', ${veg ? "TRUE" : "FALSE"});`)
    return result.affectedRows > 0
}