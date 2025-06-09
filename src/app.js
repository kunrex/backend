import './env-load.js'

import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { authMiddleware } from "./middleware/authMiddleware.js";
import {authorise, return400Response} from "./services/utils.js";
import {accessRefreshHandler, loginPageErrorHandler, loginPageHandler} from "./handlers/auth.js";
import {dashboardHandler} from "./handlers/dashboard.js";
import {
    getTagsHandler,
    newOrderHandler,
    renderOrderHandler,
    getMenuHandler,
    addSuborderHandler,
    updateSuborderHandler,
    removeSuborderHandler,
    completeOrderHandler,
    payForOrderHandler,
    renderAllOrdersHandler
} from "./handlers/orders.js";

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

app.get('/login', loginPageHandler)
app.get('/login/:error', loginPageErrorHandler)

app.post('/auth', authMiddleware)
app.get('/auth/refresh', accessRefreshHandler)

app.get('/dashboard', authorise, dashboardHandler)

app.get('/order', authorise, newOrderHandler)
app.get('/order/:orderId', authorise, renderOrderHandler)

app.get('/tags', getTagsHandler)
app.get('/menu', getMenuHandler)

app.post('/suborder/remove/:suborderId', authorise, removeSuborderHandler)
app.post('/suborder/add/:orderId/:foodId/:quantity/:instructions', authorise, addSuborderHandler)
app.post('/suborder/update/:suborderId/:quantity/:instructions', authorise, updateSuborderHandler)

app.post('/order/pay/:orderId', authorise, payForOrderHandler)
app.post('/order/complete/:orderId', authorise, completeOrderHandler)

app.get('/orders/', authorise, renderAllOrdersHandler)

app.use((req, res) => {
    return return400Response(req, res, 'Bad Request')
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