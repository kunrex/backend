import { verifyToken } from "./auth.js";
import { runDBCommand, users, escape } from "./db.js";

export const access = 'awt'
export const refresh = 'rwt'

export function now() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function between(val, min, max) {
    return min <= val && val <= max
}

export function acceptsJSON(req) {
    const header = req.header('Accept')
    if(header !== undefined)
        return header.includes('application/json')

    return false
}

export function return40XResponse(code, req, res, error) {
    if(acceptsJSON(req))
        return res.status(code).json({
            code: code,
            error: error
        })

    return res.redirect(`/login/${error}`)
}

export function return400Response(req, res, error) {
    return return40XResponse(400, req, res, error)
}

async function authoriseHeader(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];

    const accessPayload = verifyToken(token)
    if(accessPayload == null)
        return return40XResponse(401, req, res, 'Failed to authorise using Authorisation Header. Make sure format: Authorisation: BEARER {TOKEN}')

    const result = await runDBCommand(`SELECT * FROM ${users} WHERE email = ${escape(accessPayload.email)};`)
    if(result.length !== 1)
        return return40XResponse(401, req, res, 'No such user exists, please Sign Up')

    req.user = result[0]
    next()
}

async function authoriseCookies(req, res, next) {
    const cookies = req.cookies
    const accessCookie = cookies[access]
    const refreshCookie = cookies[refresh]

    if(accessCookie === 'undefined' || refreshCookie === 'undefined')
        return return40XResponse(401, req, res, 'Failed to authorise, please Sign Up if you dont have an account or Log In again if you do')

    const accessPayload = verifyToken(accessCookie)
    if(accessPayload == null)
        return res.redirect('/auth/refresh')

    const result = await runDBCommand(`SELECT * FROM ${users} WHERE email = ${escape(accessPayload.email)};`)
    if(result.length !== 1)
        return return40XResponse(401, req, res, 'No such user exists, please Sign Up')

    const user = result[0]
    if(user.auth !== accessPayload.auth)
        return return40XResponse(401, req, res, 'User auth level changed, please Log In again')

    req.user = result[0]
    next()
}

export async function authorise(req, res, next) {
    const authHeader = req.header('Authorization')
    if(authHeader !== undefined)
        await authoriseHeader(req, res, next)
    else
        await authoriseCookies(req, res, next)
}

export async function authoriseChef(req, res, next) {
    const auth = req.user.auth
    return (auth & 2) === 2 ? next() : return40XResponse(401, req, res, 'Bad Request: Permission Denied')
}

export async function authoriseAdmin(req, res, next) {
    const auth = req.user.auth
    return (auth & 4) === 4 ? next() : return40XResponse(401, req, res, 'Bad Request: Permission Denied')
}