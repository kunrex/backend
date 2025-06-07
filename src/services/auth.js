const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

const accessRefresh = { expiresIn: '1800s' }
const refreshRefresh = { expiresIn: '7d' }

export function genAccessToken(user) {
    return jwt.sign(user, secret, accessRefresh)
}

export function genRefreshToken(user) {
    return jwt.sign(user, secret, refreshRefresh)
}

export function verifyToken(token) {
    if(token == null)
        return null

    try
    {
        return jwt.verify(token, secret)
    }
    catch (error) {
        console.log(error)
        return null
    }
}