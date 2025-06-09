import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt'

const saltRounds = parseInt(process.env.SALT_ROUNDS)

export async function hash(pwd) {
    return await bcryptHash(pwd, saltRounds)
}

export async function compare(pwd, hash) {
    return await bcryptCompare(pwd, hash)
}