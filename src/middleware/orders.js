import { return400Response } from "../services/utils.js";
import { escape, orders, runDBCommand, users } from "../services/db.js";

export async function renderOrderCheck(req, res, next) {
    const orderId = parseInt(req.params.orderId)

    const rows = await runDBCommand(`SELECT ${users}.name AS authorName FROM ${orders}
                                            INNER JOIN ${users} ON ${users}.id = ${orders}.createdBy
                                            WHERE ${orders}.id = ${escape(orderId)};`)

    if(rows.length !== 1)
        return return400Response(req, res, 'Bad Request: Order not found')

    const authorName = req.params.authorName
    if(rows[0].authorName !== authorName)
        return return400Response(req, res, 'Bad Request: Order creator did not match provided author name')

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

    req.orderId = orderId
    req.readonly = rows[0].authorEmail !== req.user.email
    next()
}