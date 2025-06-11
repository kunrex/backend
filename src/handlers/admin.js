import {runDBCommand, users, escape} from "../services/db.js";
import {return400Response} from "../services/utils.js";
import {emailRegex} from "./auth.js";

export async function renderUserInfoHandler(req, res) {
    const email = req.params.email
    if(email === undefined) {
        return res.render('userinfo', {
            user: undefined
        })
    }
    else {
        if(!emailRegex.test(email))
            return return400Response(req, res, 'Email was invalid')

        const rows = await runDBCommand(`SELECT name, email, auth FROM ${users} WHERE email = ${escape(email)};`)
        if(rows.length !== 1)
            return return400Response(req, res, 'Email was invalid')

        return res.render('userinfo', {
            user: rows[0]
        })
    }
}

export async function setUserAuthHandler(req, res) {
    const email = req.params.email

    if(!emailRegex.test(email))
        return return400Response(req, res, 'Email was invalid')

    const rows = await runDBCommand(`SELECT 1 FROM ${users} WHERE email = ${escape(email)};`)
    if(rows.length !== 1)
        return return400Response(req, res, 'Email was invalid')

    const body = req.body;
    if(body === undefined)
        return return400Response(req, res, 'Bad Request')

    const auth = body.auth
    if(auth < 1 || auth > 7)
        return return400Response(req, res, 'Bad Request: Invalid authorisation status')

    await runDBCommand(`UPDATE ${users} SET auth = ${escape(auth)} WHERE email = ${escape(email)};`)

    return res.sendStatus(200)
}