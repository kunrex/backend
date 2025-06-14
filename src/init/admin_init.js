import '../env-load.js'

import fs from 'fs'

import { hash } from "../services/hash.js";
import { genRefreshToken } from "../services/auth.js";
import { runDBCommand, users, escape } from "../services/db.js";

try
{
    async function init() {
        if(!fs.existsSync('.env'))
        {
            console.log('.env not found')
            return
        }

        await runDBCommand(`INSERT INTO ${users} (name, email, pwdHash, refreshHash, auth) VALUES (
            'admin',
            'admin@backend.com',
            ${escape(await hash('adminpassword123'))},
            ${escape(await hash(genRefreshToken({
                email: 'admin@backend.com'
            })))},
            7
        );`)
    }

    await init()
}
catch (err) {
    console.log(`SQL Query Error: ${err.stack}`)
}

process.exit()