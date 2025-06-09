import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET

export const accessRefreshTime = '1800s'

const accessRefresh = { expiresIn: accessRefreshTime }
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