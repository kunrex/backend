import { compare, hash } from "../services/hash.js";
import { escape, runDBCommand, users } from "../services/db.js";
import { accessRefreshTime, genAccessToken, genRefreshToken, verifyToken } from "../services/auth.js";
import { between, access, refresh, return400Response, acceptsJSON, return40XResponse } from "../services/utils.js";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function loginPageHandler(req, res) {
    const cookies = req.cookies
    const accessCookie = cookies[access]
    const refreshCookie = cookies[refresh]

    if(accessCookie !== undefined && refreshCookie !== undefined)
        return res.redirect('/dashboard')
    else
        return res.render('login', {
            error: undefined
        })
}

export function loginPageErrorHandler(req, res) {
    return res.render('login', {
        error: req.params.error
    })
}

function checks(req, res, body) {
    if(!body.name)
        return return400Response(req, res, 'Name cannot be empty')

    if(!between(body.name.length, 1, 100))
        return return400Response(req, res, 'Name can be of max 100 characters')

    if(!body.email)
        return return400Response(req, res, 'Email cannot be empty')

    if(!emailRegex.test(body.email))
        return return400Response(req, res, 'Email was invalid')

    if(!between(body.email.length, 1, 255))
        return return400Response(req, res, 'Email can be of max 255 characters')

    if(!body.password)
        return return400Response(req, res, 'Password cannot be empty')

    if(!between(body.email.length, 1, 50))
        return return400Response(req, res, 'Password can be of max 50 characters')

    return null
}

function newRefreshToken(email) {
    return genRefreshToken({
        email: email
    })
}

function newAccessToken(email, auth) {
    return genAccessToken({
        email: email,
        auth: auth
    })
}

export async function signUpHandler(req, res) {
    const body = req.body;

    const result = checks(req, res, body);
    if(result)
        return result

    const email = body.email

    const rows = await runDBCommand(`SELECT 1 FROM ${users} WHERE email = ${escape(email)};`)
    if (rows.length > 0)
        return return400Response(req, res, 'Email already in use')

    await runDBCommand(`INSERT INTO ${users} (name, email, pwdHash, auth) VALUES (${escape(body.name)}, ${escape(email)}, ${escape(await hash(body.password))}, 1);`)

    const refreshToken = newRefreshToken(email)
    const accessToken = newAccessToken(email, 1)

    await runDBCommand(`UPDATE ${users} SET refreshHash = ${escape(await hash(refreshToken))} WHERE email = ${escape(email)};`)

    res.cookie(access, accessToken)
    res.cookie(refresh, refreshToken)

    if(acceptsJSON(req))
        return res.status(200).json({
            code: 200,
            accessToken: accessToken,
            expiresIn: accessRefreshTime,
            message: `New user created with email: ${email}`
        })

    return res.redirect('/dashboard')
}

export async function loginHandler(req, res) {
    const body = req.body;

    const result = checks(req, res, body);
    if(result)
        return result

    const email = body.email

    const existsResult = await runDBCommand(`SELECT * FROM ${users} WHERE email = ${escape(email)};`)
    if (existsResult.length !== 1)
        return return400Response(req, res, 'No such user exists, please Sign Up')

    const user = existsResult[0]

    if(!await compare(body.password, user.pwdHash))
        return return400Response(req, res, 'Email or password was incorrect')

    const refreshToken = newRefreshToken(user.email)
    const accessToken = newAccessToken(user.email, user.auth)

    const hashedRefreshToken = await hash(refreshToken)
    await runDBCommand(`UPDATE ${users} SET refreshHash = ${escape(hashedRefreshToken)} WHERE id = ${user.id};`)

    res.cookie(access, accessToken)
    res.cookie(refresh, refreshToken)

    user.refreshHash = hashedRefreshToken

    if(acceptsJSON(req))
        return res.status(200).json({
            code: 200,
            accessToken: accessToken,
            expiresIn: accessRefreshTime,
            message: `Logged in with email: ${email}`
        })

    return res.redirect('/dashboard')
}

export async function signOutHandler(req, res) {
    const user = req.user

    await runDBCommand(`UPDATE ${users} SET refreshHash = NULL WHERE id = ${escape(user.id)};`)
    res.cookie(access, undefined)
    res.cookie(refresh, undefined)

    if(acceptsJSON(req))
        return res.status(200).json({
            code: 200,
            message: "Signed out successfully"
        })

    return res.redirect('/login')
}

export async function accessRefreshHandler(req, res) {
    const cookies = req.cookies
    const refreshCookie = cookies[refresh]

    if(refreshCookie === undefined)
        return return40XResponse(401, req, res, 'Failed to get refresh token, please Log In again')

    const refreshPayload = verifyToken(refreshCookie)
    if(refreshPayload == null)
        return return40XResponse(401, req, res, 'Refresh token expired, please Log In again')

    const result = await runDBCommand(`SELECT * FROM ${users} WHERE email = ${escape(refreshPayload.email)};`)
    if(result.length !== 1)
        return return40XResponse(401, req, res, 'No such user exists, please Sign Up')

    const user = result[0]

    const accessToken = newAccessToken(user.email, user.auth)
    res.cookie(access, accessToken)

    if(acceptsJSON(req))
        return res.status(200).json({
            code: 200,
            accessToken: accessToken,
            expiresIn: accessRefreshTime,
            message: `Access token refreshed for email: ${user.em}`
        })

    return res.redirect('/dashboard')
}