const path = require("node:path");
const express = require('express')

require('dotenv').config()

const app = express()
const port = parseInt(process.env.APP_PORT)

app.use(express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'pages'));

const db = require("services/db")
const auth = require("services/auth")
const hash = require("services/hash")

app.use((req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null)
        return res.sendStatus(401)

    const result = auth.verifyToken(token)
    if (result == null)
        return res.sendStatus(403)

    req.user = result
    next()
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Internal Server Error'
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})