import { escape as esc } from 'mysql2'
import { createConnection } from 'mysql2/promise.js'

export const escape = esc

export const users = "Users"

export const foods = "Foods"
export const foodTags = "FoodTags"
export const foodTagRelations = "FoodTagRelations"

export const orders = "Orders"
export const suborders = "Suborders"

export const ordered = "ordered"
export const completed = "completed"
export const processing = "processing"

const connection = await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export async function runDBCommand(query, params = []) {
    try
    {
        const [results] = await connection.execute(query, params);
        return results
    }
    catch (err) {
        console.log(`SQL Query Error: ${err.message}; on query: ${query}`)
        return []
    }
}