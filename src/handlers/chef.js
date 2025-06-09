import { completed, escape, foods, ordered, processing, runDBCommand, suborders } from "../services/db.js";

export async function getAllOnGoingSuborders() {
    return await runDBCommand(`SELECT ${suborders}.* ${foods}.* FROM ${suborders}
        INNER JOIN ${foods} ON ${suborders}.FoodID = ${foods}.ID;
    `)
}

export async function setProcessOrder(suborderId) {
    const result = await runDBCommand(`UPDATE ${suborders} SET Status = '${escape(processing)}' WHERE ID = ${escape(suborderId)} and Status = '${escape(ordered)}';`)
    return result.affectedRows > 0
}

export async function setCompleteSuborder(suborderId) {
    const result = await runDBCommand(`UPDATE ${suborders} SET Status = '${escape(completed)}' WHERE ID = ${escape(suborderId)} and Status = '${escape(processing)}';`)
    return result.affectedRows > 0
}