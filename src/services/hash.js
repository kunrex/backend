const bcrypt = require('bcrypt')
const saltRounds = parseInt(process.env.SALT_ROUNDS)

export function hash(pwd) {
    return bcrypt.hash(pwd, saltRounds)
}

export function compare(pwd, hash) {
    return bcrypt.compare(pwd, hash)
}