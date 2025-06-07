import { now } from "../services/utils";

const db = require('../services/db');

export async function addOrder(userId) {
    const result = await db.runDBCommand(`INSERT INTO ${db.orders} (CreatedBy, Status, CreatedOn) VALUES (
            ${db.escape(userId)}), 
            ${db.ordered}, 
            ${now()});
        `)

    return result.affectedRows > 0
}

export async function getOrder(orderId) {
    return await db.runDBCommand(`SELECT * FROM ${db.orders} WHERE ID = ${db.escape(orderId)};`)
}

export async function getUserOrders(userId) {
    return await db.runDBCommand(`SELECT * FROM ${db.orders} WHERE CreatedBy = ${db.escape(userId)};`)
}

export async function addSuborder(suborders) {
    const values = []
    suborders.forEach(suborder => {
        values.push(`(${db.escape(suborder.foodId)}), ${db.escape(suborder.orderId)}), ${db.escape(suborder.userId)}), ${db.escape(suborder.quantity)}), '${db.escape(suborder.instructions)})', ${db.ordered})`)
    })

    await db.runDBCommand(`INSERT INTO ${db.suborders} (FoodId, OrderId, AddedBy, Quantity, Instructions, Status) VALUES ${values.join(', ')};`)
    await db.runDBCommand()
}

export async function getSuborders(orderId) {
    return await db.runDBCommand(`SELECT ${db.suborders}.* ${db.foods}.* FROM ${db.suborders} WHERE ID = ${db.escape(orderId)}
        INNER JOIN ${db.foods} ON ${db.suborders}.FoodID = ${db.foods}.ID;
    `)
}

export async function getMenu() {
    return await db.runDBCommand(`SELECT ${db.foods}.*, GROUP_CONCAT(${db.foodTags}.Name ORDER BY ${db.foodTags}.ID) AS Tags, GROUP_CONCAT(${db.foodTags}.Colour ORDER BY ${db.foodTags}.ID) AS Colours FROM ${db.foods}
        INNER JOIN ${db.foodTagRels} ON ${db.foods}.ID = ${db.foodTagRels}.FoodID
        INNER JOIN ${db.foodTags} ON ${db.foodTags}.ID = ${db.foodTagRels}.TagID
        GROUP BY ${db.foods}.ID
        ORDER BY ${db.foods}.ID
    );`)
}

export async function completeOrder(orderId) {
    const result = await db.runDBCommand(`UPDATE ${db.orders} SET Status = ${db.completed}, CompletedOn = ${now()} WHERE Id = ${orderId};`)
    return result.affectedRows > 0
}

export async function payForOrder(userId, orderId, subtotal, discount, tip) {
    const result = await db.runDBCommand(`UPDATE ${db.orders} SET 
        Subtotal = ${db.escape(subtotal)}, 
        Discount = ${db.escape(discount)}, 
        Tip = ${db.escape(tip)},
        
        Total = ${db.escape( subtotal * (100 - discount) / 100.0 + tip)},
        
        PayedBy = ${db.escape(userId)},
        PayedOn = ${now()}
    WHERE Id = ${orderId};`)

    return result.affectedRows > 0
}