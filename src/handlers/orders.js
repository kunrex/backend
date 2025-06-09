import {
    runDBCommand,
    escape,
    orders,
    foodTags,
    foods,
    foodTagRelations,
    suborders,
    ordered, completed, users
} from "../services/db.js";
import {between, now, return400Response, supportsJson} from "../services/utils.js";

export async function newOrderHandler(req, res) {
    const user = req.user

    const rows = await runDBCommand(`SELECT id FROM ${orders} WHERE createdBy = ${escape(user.id)} AND status != ${escape(completed)};`)
    if(rows.length > 0)
        return res.redirect(`orders/${rows[0].id}`)

    const result = await runDBCommand(`INSERT INTO ${orders} (createdBy, status, createdOn) VALUES (
        ${escape(user.id)},
        ${escape('ordered')},
        ${escape(now())}
    );`)

    return res.redirect(`/order/${result.insertId}`)
}

const tags = await runDBCommand(`SELECT name FROM ${foodTags};`)

const menu = await runDBCommand(`SELECT ${foods}.*, GROUP_CONCAT(${foodTags}.Name ORDER BY ${foodTags}.ID) AS tags FROM ${foods}
                                            INNER JOIN ${foodTagRelations} ON ${foods}.ID = ${foodTagRelations}.FoodID
                                            INNER JOIN ${foodTags} ON ${foodTags}.ID = ${foodTagRelations}.TagID
                                            GROUP BY ${foods}.ID
                                            ORDER BY ${foods}.ID;`)

export function addTag(tag) {
    tags.push(tag)
}

export async function addFood(foodId) {
    menu.push(await runDBCommand(`SELECT ${foods}.*, GROUP_CONCAT(${foodTags}.Name ORDER BY ${foodTags}.ID) AS Tags FROM ${foods}
                                            INNER JOIN ${foodTagRelations} ON ${foods}.ID = ${foodTagRelations}.FoodID
                                            INNER JOIN ${foodTags} ON ${foodTags}.ID = ${foodTagRelations}.TagID
                                            WHERE ${foods}.id = ${escape(foodId)};`))
}

export async function renderOrderHandler(req, res) {
    const orderId = parseInt(req.params.orderId)

    const orders = await runDBCommand(`SELECT ${suborders}.*, ${foods}.name FROM ${suborders} 
                                            INNER JOIN ${foods} ON ${suborders}.foodId = ${foods}.id
                                            WHERE ${suborders}.orderId = ${escape(orderId)};`)

    if(supportsJson(req))
        return res.status(200).send({
            code: 200,
            orders: orders
        })

    const tagValues = []
    for(let i = 0; i < tags.length; i++)
        tagValues.push(tags[i].name)

    return res.render('order', {
        menu: menu,
        orders: orders,
        tags: tagValues,
        orderId: orderId,
        completed: (await runDBCommand(`SELECT * FROM ${orders} WHERE id = ${orderId}`)).status === 'completed'
    })
}

export function getTagsHandler(req, res) {
    const tagValues = []
    for(let i = 0; i < tags.length; i++)
        tagValues.push(tags[i].name)

    return res.json({
        code: 200,
        tags: tagValues
    })
}

export function getMenuHandler(req, res) {
    return res.json({
        code: 200,
        menu: menu
    })
}

export async function addSuborderHandler(req, res) {
    const user = req.user
    const params = req.params

    const instructions = params.instructions
    const foodId = parseInt(params.foodId)
    const orderId = parseInt(params.orderId)
    const quantity = parseInt(params.quantity)

    if(orderId === undefined)
        return return400Response(req, res, 'Bad Request')

    if((await runDBCommand(`SELECT 1 FROM ${foods} WHERE id = ${escape(foodId)}`)).length === 0)
        return return400Response(req, res, 'Bad Request: Invalid FoodID')

    if(!between(quantity, 0, Number.MAX_VALUE))
        return return400Response(req, res, 'Bad Request: Invalid quantity')

    if(!between(instructions.length, 1, 300))
        return return400Response(req, res, 'Bad Request: Invalid Instruction')

    await runDBCommand(`INSERT INTO ${suborders} (foodId, orderId, authorId, quantity, instructions, status) VALUES (
        ${escape(foodId)},
        ${escape(orderId)},
        ${escape(user.id)},
        ${escape(quantity)},
        ${escape(instructions)},
        ${escape(ordered)}
    );`)

    return res.sendStatus(200)
}

export async function removeSuborderHandler(req, res) {
    const suborderId = parseInt(req.params.suborderId)

    const rows = await runDBCommand(`SELECT status from ${suborders} where id = ${suborderId};`)
    if(rows.length === 0)
        return return400Response(req, res, 'Bad Request: No such suborder')

    const suborder = rows[0]
    if(suborder.status !== ordered)
        return return400Response(req, res, 'Bad Request: Can only remove orders that have not been processed')

    await runDBCommand(`DELETE FROM ${suborders} WHERE id = ${suborderId};`)

    return res.sendStatus(200)
}

export async function updateSuborderHandler(req, res) {
    const params = req.params

    const instructions = params.instructions
    const quantity = parseInt(params.quantity)
    const suborderId = parseInt(params.orderId)

    if(suborderId === undefined)
        return return400Response(req, res, 'Bad Request')

    const rows = await runDBCommand(`SELECT status from ${suborders} where id = ${suborderId};`)
    if(rows.length === 0)
        return return400Response(req, res, 'Bad Request: No such suborder')

    const suborder = rows[0]
    if(suborder.status !== ordered)
        return return400Response(req, res, 'Bad Request: Can only update orders that have not been processed')

    if(!between(quantity, 0, Number.MAX_VALUE))
        return return400Response(req, res, 'Bad Request: Invalid quantity')

    if(!between(instructions.length, 1, 300))
        return return400Response(req, res, 'Bad Request: Invalid Instruction')

    await runDBCommand(`UPDATE ${suborders} 
                          SET quantity = ${escape(quantity)}, instructions = ${escape(instructions)},
                          WHERE id = ${suborderId};`)

    return res.sendStatus(200)
}

export async function completeOrderHandler(req, res) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT status from ${suborders} where id = ${orderId};`)
    if(rows.length === 0)
        return return400Response(req, res, 'Bad Request: No such suborder')

    const suborder = rows[0]
    if(suborder.status !== ordered)
        return return400Response(req, res, 'Bad Request: Can only remove orders that have not been processed')

    await runDBCommand(`UPDATE ${orders}
                           SET status = ${escape(completed)}, completedOn = ${escape(now())}}
                           WHERE id = ${orderId};`)

    return res.sendStatus(200)
}

export async function payForOrderHandler(req, res) {
    return res.sendStatus(200)
}

export async function renderAllOrdersHandler(req, res) {
    const userId = req.user.id

    if ((await runDBCommand(`SELECT 1 FROM ${users} WHERE userId = ${userId};`)).length === 0)
        return return400Response(req, res, 'Bad Request')

    return res.render('orders', {
        orders:  await runDBCommand(`SELECT * FROM ${orders} WHERE createdBY = ${escape(userId)};`)
    })
}