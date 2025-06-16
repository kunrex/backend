import fs from "fs";
import path from "path";
import axios from "axios";

import { between, return400Response } from "../services/utils.js";
import { runDBCommand, users, escape, foods, foodTagRelations, foodTags } from "../services/db.js";

import { emailRegex } from "./auth.js";
import { tags, menu, addTag, addFood, updateFoodTags } from "./orders.js";

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

export async function renderAddHandler(req, res) {
    const tagValues = []
    for(let i = 0; i < tags.length; i++)
        tagValues.push(tags[i].name)

    const menuValues = []
    for(let i = 0; i < menu.length; i++)
    {
        const current = menu[i]

        menuValues.push({
            id: current.id,
            name: current.name,
            tags: current.tags
        })
    }

    return res.render('add', {
        tags: tagValues,
        menu: menuValues
    })
}

export async function addTagHandler(req, res) {
    const tag = req.params.tag.toLowerCase().trim()

    if(!between(tag.length, 1, 50))
        return return400Response(req, res, 'Bad Request: Tag length can be 50 characters max')

    for(let i = 0; i < tags.length; i++)
        if(tags[i].name === tag)
            return return400Response(req, res, 'Bad Request: Tag already exists')

    const result = await runDBCommand(`INSERT INTO ${foodTags} (name) VALUES (${escape(tag)});`)
    addTag({
        id: result.insertId,
        name: tag
    })

    return res.sendStatus(200)
}

export async function editTagsHandler(req, res) {
    const foodId = parseInt(req.params.foodId)

    let food = null
    for(let i = 0 ; i < menu.length; i++)
        if(menu[i].id === foodId)
            food = menu[i]

    if(food == null)
        return return400Response(req, res, 'Bad Request: Invalid food id')

    const body = req.body
    if(body === undefined)
        return return400Response(req, res, 'Bad Request')

    const newTags = body.tags
    if(!Array.isArray(newTags))
        return return400Response(req, res, 'Bad Request: Invalid tags')

    const inserts = []
    for(let i = 0; i < newTags.length; i++)
    {
        const current = newTags[i]
        if(typeof current !== 'string')
            return return400Response(req, res, 'Bad Request: Invalid tags')

        newTags[i] = current.toLowerCase().trim()
        const rows = await runDBCommand(`SELECT id from ${foodTags} WHERE name = ${escape(newTags[i])};`)
        if(rows.length !== 1)
            return return400Response(req, res, 'Bad Request: Invalid tags')

        inserts.push(`(${escape(foodId)}, ${rows[0].id})`)
    }

    await runDBCommand(`DELETE FROM ${foodTagRelations} WHERE foodId = ${escape(foodId)};`)
    await runDBCommand(`INSERT INTO ${foodTagRelations} (foodID, tagID) VALUES ${inserts.join(',')};`)

    updateFoodTags(foodId, newTags.join(','))

    return res.sendStatus(200)
}

const timeRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/

async function downloadImage(url, imagePath) {
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(imagePath))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e))
            }),
    )
}

export async function addFoodHandler(req, res) {
    const body = req.body
    if(body === undefined)
        return return400Response(req, res, 'Bad Request')

    const name = body.name
    const price = body.price
    const description = body.description

    const veg = body.veg
    const cookTime = body.cookTime

    const imageURL = body.image

    if(typeof name !== 'string' || typeof price !== 'number' || typeof description !== 'string' || typeof veg !== 'boolean' || typeof cookTime !== 'string' || typeof imageURL !== 'string')
        return return400Response(req, res, 'Bad Request')

    if(!between(name.length, 1, 100))
        return return400Response(req, res, 'Bad Request: Name can have maximum 100 characters')

    if((await runDBCommand(`SELECT 1 FROM ${foods} WHERE name = ${name}`)).length > 0)
        return return400Response(req, res, 'Bad Request: Food with same name already exists')

    if(!between(description.length, 1, 300))
        return return400Response(req, res, 'Bad Request: Description can have maximum 300 characters')

    if(!Number.isInteger(price) || price <= 0)
        return return400Response(req, res, 'Bad Request: Price must be a natural number')

    if(!timeRegex.test(cookTime))
        return return400Response(req, res, 'Bad Request: Cooking time must be HH:MM:SS format')

    const relativePath = path.join('foods', `${name}.jpeg`)
    try
    {
        await downloadImage(imageURL, path.join(process.cwd(), 'assets', relativePath))
    }
    catch {
        return return400Response(req, res, 'Bad Request: Failed to save image')
    }

    const result = await runDBCommand(`INSERT INTO ${foods} (name, price, description, veg, cookTime, image) VALUES (
        ${escape(name)},
        ${escape(price)},
        ${escape(description)},
        ${escape(veg)},
        ${escape(cookTime)},
        ${escape(relativePath)}
    );`)

    addFood({
        id: result.insertId,

        name: name,
        description: description,

        veg: veg,
        cookTime: cookTime,
        price: price,

        image: path
    })
}