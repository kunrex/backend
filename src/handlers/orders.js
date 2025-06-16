import { between, now, return400Response, acceptsJSON } from "../services/utils.js";
import { runDBCommand, escape, orders, foodTags, foods, foodTagRelations, suborders, ordered, completed, users, processing } from "../services/db.js";

export async function newOrderHandler(req, res) {
    const user = req.user

    const rows = await runDBCommand(`SELECT id FROM ${orders} WHERE createdBy = ${escape(user.id)} AND payedBy IS NULL;`)
    if(rows.length > 0)
        return res.redirect(`order/${rows[0].id}/${req.user.name}`)

    const result = await runDBCommand(`INSERT INTO ${orders} (createdBy, status, createdOn) VALUES (
        ${escape(user.id)},
        ${escape('ordered')},
        ${escape(now())}
    );`)

    return res.redirect(`/order/${result.insertId}/${req.user.name}`)
}

export const tags = await runDBCommand(`SELECT name FROM ${foodTags};`)

export const menu = await runDBCommand(`SELECT ${foods}.*, IFNULL(GROUP_CONCAT(${foodTags}.Name ORDER BY ${foodTags}.ID), '') AS tags FROM ${foods}
                                            LEFT JOIN ${foodTagRelations} ON ${foods}.ID = ${foodTagRelations}.FoodID
                                            LEFT JOIN ${foodTags} ON ${foodTags}.ID = ${foodTagRelations}.TagID
                                            GROUP BY ${foods}.ID
                                            ORDER BY ${foods}.ID;`)

export function addTag(tag) {
    tags.push(tag)
}

export function addFood(food) {
    menu.push(food)
}

export function updateFoodTags(foodId, tags) {
    const food = menu.find(x => x.id === foodId)
    food.tags = tags
}

export async function renderOrderHandler(req, res) {
    const orderId = parseInt(req.params.orderId)
    const bypass = req.params.bypass === 'true'

    const rows = await runDBCommand(`SELECT ${users}.name AS authorName, ${users}.email as authorEmail FROM ${orders}
                                            INNER JOIN ${users} ON ${users}.id = ${orders}.createdBy
                                            WHERE ${orders}.id = ${escape(orderId)};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: Order not found')

    const authorName = req.params.authorName
    if(rows[0].authorName !== authorName)
        return return400Response(req, res, 'Bad Request: Order creator did not match provided author name')

    const allSuborders = await runDBCommand(`SELECT ${suborders}.*, ${foods}.name, ${users}.name AS authorName FROM ${suborders} 
                                            INNER JOIN ${foods} ON ${suborders}.foodId = ${foods}.id
                                            INNER JOIN ${users} ON ${suborders}.authorId = ${users}.id
                                            WHERE ${suborders}.orderId = ${escape(orderId)};`)

    const block = req.user.email !== rows[0].authorEmail && !bypass

    if(acceptsJSON(req))
        return block ? res.status(200).send({
            code: 200,
            orders: allSuborders
        }) : res.sendStatus(500).send({
            code: 500,
            message: 'Bad Request: Cannot access orders that are not yours'
        })

    const tagValues = []
    for(let i = 0; i < tags.length; i++)
        tagValues.push(tags[i].name)

    const order = (await runDBCommand(`SELECT * FROM ${orders} WHERE id = ${orderId};`))[0]

    return res.render('order', {
        menu: menu,
        orders: allSuborders,
        tags: tagValues,
        orderId: orderId,
        completed: block || order.status === 'completed',
        payed: block || order.payedBy != null
    })
}

async function tryAddSuborder(userId, orderId, suborder) {
    const foodId = suborder.foodId
    const quantity = suborder.quantity
    const instructions = suborder.instructions

    if(!between(quantity, 0, Number.MAX_VALUE))
        return null

    if(!between(instructions.length, 0, 300))
        return null

    if((await runDBCommand(`SELECT 1 FROM ${foods} WHERE id = ${escape(foodId)};`)).length === 0)
        return null

    return `(${escape(foodId)}, ${escape(orderId)}, ${escape(userId)}, ${escape(quantity)}, ${escape(instructions)}, ${escape(ordered)})`
}

async function tryRemoveSuborder(suborderId) {
    const rows = await runDBCommand(`SELECT status from ${suborders} where id = ${suborderId};`)
    if(rows.length === 0)
        return

    const suborder = rows[0]
    if(suborder.status !== ordered)
        return

    await runDBCommand(`DELETE FROM ${suborders} WHERE id = ${suborderId};`)
}

async function tryUpdateSuborder(suborder) {
    const suborderId = suborder.id
    const quantity = suborder.quantity
    const instructions = suborder.instructions

    if(!between(quantity, 1, Number.MAX_VALUE))
        return

    if(!between(instructions.length, 0, 300))
        return

    const rows = await runDBCommand(`SELECT status FROM ${suborders} WHERE id = ${escape(suborderId)};`)
    if(rows.length === 0 || rows[0].status !== ordered)
        return null

    await runDBCommand(`UPDATE ${suborders} 
                          SET quantity = ${escape(quantity)}, instructions = ${escape(instructions)}
                          WHERE id = ${escape(suborderId)};`)
}

export async function updateOrderHandler(req, res) {
    const userId = req.user.id
    const orderId = parseInt(req.params.orderId)

    const body = req.body
    if(body === undefined)
        return return400Response(req, res, 'Bad Request: Body not defined')

    if(!Number.isInteger(orderId) || orderId < 0 || (await runDBCommand(`SELECT 1 FROM ${orders} WHERE id = ${escape(orderId)} AND status != ${escape(completed)};`)).length === 0)
        return return400Response(req, res, 'Bad Request: Order not found')

    const actions = body.actions
    if(actions === undefined || !Array.isArray(actions))
        return return400Response(req, res, 'Bad Request: Actions not found')

    const inserts = []

    for(let i = 0; i < actions.length; i++) {
        const current = actions[i]

        if(current.state === undefined || current.id === undefined || current.quantity === undefined || current.foodId === undefined || current.instructions === undefined || typeof current.quantity !== 'number')
            return return400Response(req, res, 'Bad Request: Suborders require a valid status, id, quantity, foodId and instruction')

        switch(current.state) {
            case 1:
                if(current.quantity > 0)
                    await tryUpdateSuborder(current)
                else
                    await tryRemoveSuborder(current.id)
                break
            case 2:
                if(current.quantity > 0)
                {
                    const result = await tryAddSuborder(userId, orderId, current)
                    if(result != null)
                        inserts.push(result)
                }
                break
            default:
                break
        }
    }

    if(inserts.length >0)
        await runDBCommand(`INSERT INTO ${suborders} (foodId, orderId, authorId, quantity, instructions, status) VALUES ${inserts.join(', ')};`)

    return res.redirect('/dashboard')
}

export async function completeOrderHandler(req, res) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT status from ${orders} where id = ${orderId};`)
    if(rows.length === 0)
        return return400Response(req, res, 'Bad Request: No such suborder')

    const order = rows[0]
    if(order.status === completed)
        return return400Response(req, res, 'Bad Request: Order is already complete')

    await runDBCommand(`UPDATE ${orders}
                           SET status = ${escape(completed)}, completedOn = ${escape(now())}
                           WHERE id = ${orderId};`)

    return res.sendStatus(200)
}

export async function renderPaymentHandler(req, res) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT payedBy, status FROM ${orders} WHERE id = ${orderId};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: No such order')

    const order = rows[0]
    if(order.status !== completed)
        return return400Response(req, res, 'Bad Request: Order is not completed')

    if(order.payedBy != null)
        return return400Response(req, res, 'Bad Request: Order is already payed for')

    const result = (await runDBCommand(`SELECT SUM(${foods}.price * ${suborders}.quantity) AS subtotal FROM ${suborders}
                                              INNER JOIN ${foods} ON ${foods}.id = ${suborders}.foodId
                                              WHERE ${suborders}.orderId = ${escape(orderId)}`))

    const subtotal = result[0].subtotal

    return res.render('pay', {
        userId: req.user.id,
        orderId: orderId,
        subtotal: subtotal,
        discount: (subtotal < 1000) ? 0 : (subtotal < 2000 ? 10 : 15)
    })
}

export async function confirmPaymentHandler(req, res) {
    const orderId = parseInt(req.params.orderId)

    const body = req.body
    if(body === undefined)
        return return400Response(req, res, 'Bad Request')

    const tip = body.tip
    const total = body.total
    const subtotal = body.subtotal
    const discount = body.discount

    if(tip === undefined || total === undefined || subtotal === undefined || discount === undefined || typeof tip != 'number' || typeof total != 'number' || typeof subtotal != 'number' || typeof discount != 'number')
        return return400Response(req, res, 'Bad Request')

    const rows = await runDBCommand(`SELECT payedBy, status FROM ${orders} WHERE id = ${orderId};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: No such order')

    const order = rows[0]
    if(order.status !== completed)
        return return400Response(req, res, 'Bad Request: Order is not completed')

    if(order.payedBy != null)
        return return400Response(req, res, 'Bad Request: Order is already payed for')

    await runDBCommand(`UPDATE ${orders} SET 
                          payedBy = ${req.user.id}, 
                          payedOn = ${escape(now())},
                          tip = ${escape(tip)},
                          total = ${escape(total)},
                          subtotal = ${escape(subtotal)},
                          discount = ${escape(discount)}
                          WHERE id = ${escape(orderId)};`)

    return res.sendStatus(200)
}

export async function renderIncompleteSubordersHandler(req, res) {
    const allSuborders = await runDBCommand(`SELECT ${foods}.name, ${suborders}.id, ${suborders}.quantity, ${suborders}.instructions, ${suborders}.status FROM ${suborders}
                                                    INNER JOIN ${foods} ON ${foods}.id = ${suborders}.foodID
                                                    WHERE ${suborders}.status != ${escape(completed)};`)

    return res.render('suborders', {
        suborders: allSuborders
    })
}

export async function updateSubordersStatusHandler(req, res) {
    const body = req.body
    if(body === undefined)
        return return400Response(req, res, 'Bad Request: Body not defined')

    const actions = body.actions
    if(actions === undefined || !Array.isArray(actions))
        return return400Response(req, res, 'Bad Request: Actions not found')

    for(let i = 0; i < actions.length; i++) {
        const current = actions[i]

        if(current.id === undefined || current.status === undefined || typeof current.id != 'number')
            return return400Response(req, res, 'Bad Request: Suborders require a valid id and status')

        switch(current.status) {
            case processing:
                await runDBCommand(`UPDATE ${suborders} SET status = ${escape(processing)} WHERE id = ${current.id};`)
                break
            case completed:
                await runDBCommand(`UPDATE ${suborders} SET status = ${escape(completed)} WHERE id = ${current.id};`)
                break
        }
    }

    return res.redirect('/dashboard')
}

export async function renderAllOrdersHandler(req, res) {
    const allOrders = await runDBCommand(`SELECT ${orders}.id, ${orders}.createdOn, ${users}.name AS authorName, ${orders}.status FROM ${orders}
                                                 INNER JOIN ${users} ON ${users}.id = ${orders}.createdBy;`)

    return res.render('orders', {
        allowJoin: false,
        orders: allOrders
    })
}

export async function renderUserOrdersHandler(req, res) {
    const allOrders = await runDBCommand(`SELECT id, createdOn, ${escape(req.user.name)} AS authorName, status FROM ${orders} WHERE createdBy = ${escape(req.user.id)};`)

    return res.render('orders', {
        allowJoin: true,
        orders: allOrders
    })
}