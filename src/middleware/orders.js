import { return400Response } from "../services/utils.js";
import { escape, orderRelations, orders, runDBCommand, users } from "../services/db.js";

export async function renderOrderCheck(req, res, next) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT ${users}.id, ${users}.name AS authorName FROM ${orders}
                                            INNER JOIN ${users} ON ${users}.id = ${orders}.createdBy
                                            WHERE ${orders}.id = ${escape(orderId)};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: Order not found')

    const authorName = req.params.authorName
    if(rows[0].authorName !== authorName)
        return return400Response(req, res, 'Bad Request: Order creator did not match provided author name')

    const user = req.user
    if((await runDBCommand(`SELECT 1 FROM ${orderRelations} WHERE userId = ${escape(user.id)} AND orderId = ${orderId};`)).length === 0)
        await runDBCommand(`INSERT INTO ${orderRelations} (userId, orderId) VALUES (${escape(user.id)}, ${escape(orderId)});`)

    req.orderId = orderId
    req.readonly = false
    next()
}

export async function readonlyCheck(req, res, next) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT ${users}.email AS authorEmail FROM ${orders}
                                            INNER JOIN ${users} ON ${users}.id = ${orders}.createdBy
                                            WHERE ${orders}.id = ${escape(orderId)};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: Order not found')

    const user = req.user

    req.orderId = orderId
    req.readonly = (await runDBCommand(`SELECT 1 FROM ${orderRelations} WHERE userId = ${escape(user.id)} AND orderId = ${orderId};`)).length === 0
    next()
}