const db = require('../services/db')

export async function getAllOnGoingSuborders() {
    return await db.runDBCommand(`SELECT ${db.suborders}.* ${db.foods}.* FROM ${db.suborders}
        INNER JOIN ${db.foods} ON ${db.suborders}.FoodID = ${db.foods}.ID;
    `)
}

export async function setProcessOrder(suborderId) {
    const result = await db.runDBCommand(`UPDATE ${db.suborders} SET Status = '${db.processing}' WHERE ID = id and Status = '${db.ordered}';`)
    return result.affectedRows > 0
}

export async function setCompleteSuborder(suborderId) {
    const result = await db.runDBCommand(`UPDATE ${db.suborders} SET Status = '${db.completed}' WHERE ID = id and Status = '${db.processing}';`)
    return result.affectedRows > 0
}