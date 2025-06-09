import { now } from "../services/utils";
import { orders, escape, runDBCommand, ordered, suborders, foods, foodTags, foodTagRelations, completed } from "../services/db.js";

export async function addOrder(userId) {
    const result = await runDBCommand(`INSERT INTO ${orders} (CreatedBy, Status, CreatedOn) VALUES (
            ${escape(userId)}), 
            ${ordered}, 
            ${now()});
        `)

    return result.affectedRows > 0
}

export async function getOrder(orderId) {
    return await runDBCommand(`SELECT * FROM ${orders} WHERE ID = ${escape(orderId)};`)
}

export async function getUserOrders(userId) {
    return await runDBCommand(`SELECT * FROM ${orders} WHERE CreatedBy = ${escape(userId)};`)
}

export async function addSuborder(allSuborders) {
    const values = []
    allSuborders.forEach(suborder => {
        values.push(`(${escape(suborder.foodId)}), ${escape(suborder.orderId)}), ${escape(suborder.userId)}), ${escape(suborder.quantity)}), ${escape(suborder.instructions)}), ${ordered})`)
    })

    await runDBCommand(`INSERT INTO ${suborders} (FoodId, OrderId, AddedBy, Quantity, Instructions, Status) VALUES ${values.join(', ')};`)
}

export async function getSuborders(orderId) {
    return await runDBCommand(`SELECT ${suborders}.* ${foods}.* FROM ${suborders} WHERE ID = ${escape(orderId)}
        INNER JOIN ${foods} ON ${suborders}.FoodID = ${foods}.ID;
    `)
}

export async function getMenu() {
    return await runDBCommand(`SELECT ${foods}.*, GROUP_CONCAT(${foodTags}.Name ORDER BY ${foodTags}.ID) AS Tags, GROUP_CONCAT(${foodTags}.Colour ORDER BY ${foodTags}.ID) AS Colours FROM ${foods}
        INNER JOIN ${foodTagRelations} ON ${foods}.ID = ${foodTagRelations}.FoodID
        INNER JOIN ${foodTags} ON ${foodTags}.ID = ${foodTagRelations}.TagID
        GROUP BY ${foods}.ID
        ORDER BY ${foods}.ID
    );`)
}

export async function completeOrder(orderId) {
    const result = await runDBCommand(`UPDATE ${orders} SET Status = ${escape(completed)}, CompletedOn = ${now()} WHERE Id = ${orderId};`)
    return result.affectedRows > 0
}

export async function payForOrder(userId, orderId, subtotal, discount, tip) {
    const result = await runDBCommand(`UPDATE ${orders} SET 
        Subtotal = ${escape(subtotal)}, 
        Discount = ${escape(discount)}, 
        Tip = ${escape(tip)},
        
        Total = ${escape( subtotal * (100 - discount) / 100.0 + tip)},
        
        PayedBy = ${escape(userId)},
        PayedOn = ${now()}
    WHERE Id = ${orderId};`)

    return result.affectedRows > 0
}