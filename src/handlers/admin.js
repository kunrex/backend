import { now } from "../services/utils";
import { completed, foodTags, orders, runDBCommand, escape, foods, foodTagRelations, users } from "../services/db";

export async function getAllOrder() {
    return await runDBCommand(`SELECT * FROM ${orders};`)
}

export async function getOnGoingOrders() {
    return await runDBCommand(`SELECT * FROM ${orders} WHERE CompletedOn IS NULL;`)
}

export async function forceCompleteOrder(id) {
    const result = await runDBCommand(`UPDATE ${orders} SET Status = ${escape(completed)}, CompletedOn = ${now()} WHERE Id = ${id};`)
    return result.affectedRows > 0
}

export async function getAllTags() {
    return await runDBCommand(`SELECT * FROM ${foodTags};`)
}

export async function addTag(tag, colourHex) {
    const result = await runDBCommand(`INSERT INTO ${foodTags} (Name, Colour) VALUES (${escape(tag)}, ${escape(colourHex)})`)
    return result.affectedRows > 0
}

export async function addFood(name, description, time, veg, tags) {
    const result = await runDBCommand(`INSERT INTO ${foods} (Name, Description, Time, Veg) VALUES (${escape(name)}, ${escape(description)}, ${escape(time)}, ${veg ? 'TRUE' : 'FALSE'});`)

    if(result.affectedRows > 0)
        return await addTagsToFood(await runDBCommand('SELECT LAST_INSERT_ID();'), tags)

    return false
}

export async function addTagsToFood(foodId, tags) {
    const inserts = []
    tags.forEach(tag => {
        inserts.push(`(${foodId}, ${escape(tag)})`)
    })

    if(inserts.length > 0)
    {
        const result = await runDBCommand(`INSERT INTO ${foodTagRelations} (FoodId, TagID) VALUES ${escape(inserts.join(', '))};`)
        return result.affectedRows > 0
    }

    return true
}

export async function assignChefPerms(userId) {
    const result = await runDBCommand(`UPDATE ${users} SET Tag = Tag | 2 WHERE ID = ${escape(userId)}`);
    return result.affectedRows > 0
}

export async function assignAdminPerms(userId) {
    const result = await runDBCommand(`UPDATE ${users} SET Tag = Tag | 3 WHERE ID = ${escape(userId)}`);
    return result.affectedRows > 0
}