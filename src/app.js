import './env-load.js'

import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { auth } from "./middleware/auth.js";
import { authorise } from "./services/utils.js";
import {accessRefreshHandler} from "./handlers/auth.js";
import {dashboardHandler} from "./handlers/dashboard.js";

const __dirname = import.meta.dirname;

const app = express()
const port = parseInt(process.env.APP_PORT)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'assets')))
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'pages'))

app.post('/auth', auth)
app.get('/auth/refresh', accessRefreshHandler)

app.get('/login', (req, res) => {
    res.render('login', {
        error: req.query === undefined ? undefined : req.query.error
    })
})

app.get('/dashboard', authorise, dashboardHandler)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Internal Server Error'
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})