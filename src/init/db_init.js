import '../env-load.js'

import fs from 'fs'
import { runDBCommand } from "../services/db.js";

try
{
    async function init() {
        const args = process.argv.slice(2)
        if(args.length < 1) {
            console.log('Expected name of sql file')
            return
        }

        const file = args[0]
        if(!fs.existsSync(file))
        {
            console.log('Expected name of sql file')
            return
        }

        const sql = fs.readFileSync(file, 'utf-8')
        await runDBCommand(sql)
    }

    await init()
}
catch (err) {
    console.log(`SQL Query Error: ${err.stack}`)
}