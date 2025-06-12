import './env-load.js'

import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { authMiddleware } from "./middleware/auth.js";
import {authorise, authoriseAdmin, authoriseChef, return400Response} from "./services/utils.js";
import {accessRefreshHandler, loginPageErrorHandler, loginPageHandler, signOutHandler} from "./handlers/auth.js";
import {dashboardHandler} from "./handlers/dashboard.js";
import {
    newOrderHandler,
    renderOrderHandler,
    completeOrderHandler,
    renderPaymentHandler,
    updateOrderHandler,
    confirmPaymentHandler,
    renderIncompleteSubordersHandler,
    updateSubordersStatusHandler,
    renderUserOrdersHandler, renderAllOrdersHandler
} from "./handlers/orders.js";
import {
    addFoodHandler,
    addTagHandler,
    editTagsHandler,
    renderAddHandler,
    renderUserInfoHandler,
    setUserAuthHandler
} from "./handlers/admin.js";

const __dirname = import.meta.dirname;

const app = express()
const port = parseInt(process.env.APP_PORT)

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'assets')))
app.use('/bootstrap_js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')))
app.use('/bootstrap_css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'pages'))

app.get('/login', loginPageHandler)
app.get('/login/:error', loginPageErrorHandler)

app.post('/auth', authMiddleware)
app.get('/auth/refresh', accessRefreshHandler)

app.get('/dashboard', authorise, dashboardHandler)

app.get('/order', authorise, newOrderHandler)
app.get('/order/:orderId/:authorName', authorise, renderOrderHandler)

app.post('/order/pay/:orderId', authorise, renderPaymentHandler)
app.post('/order/update/:orderId', authorise, updateOrderHandler)
app.post('/order/complete/:orderId', authorise, completeOrderHandler)

app.get('/pay/:orderId', authorise, renderPaymentHandler)
app.post('/pay/confirm/:orderId', authorise, confirmPaymentHandler)

app.get('/suborders', authorise, authoriseChef, renderIncompleteSubordersHandler)
app.post('/suborders/update', authorise, authoriseChef, updateSubordersStatusHandler)

app.get('/orders/my/', authorise, renderUserOrdersHandler)
app.get('/orders/all/', authorise, authoriseAdmin, renderAllOrdersHandler)

app.get('/admin/userinfo', authorise, authoriseAdmin, renderUserInfoHandler)
app.get('/admin/userinfo/:email', authorise, authoriseAdmin, renderUserInfoHandler)

app.post('/admin/grant/:email', authorise, authoriseAdmin, setUserAuthHandler)

app.get('/admin/add', authorise, authoriseAdmin, renderAddHandler)

app.post('/admin/add/food', authorise, authoriseAdmin, addFoodHandler)
app.post('/admin/add/tags/add/:tag', authorise, authoriseAdmin, addTagHandler)
app.post('/admin/add/tags/edit/:foodId', authorise, authoriseAdmin, editTagsHandler)

app.get('/signout', authorise, signOutHandler)

app.use((req, res) => {
    return return400Response(req, res, 'Bad Request')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    return res.status(500).json({
        code: 500,
        error: 'Internal Server Error'
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})