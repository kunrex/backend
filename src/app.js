import './env-load.js'

import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { authorise } from "./services/utils.js";

import { signOutHandler } from "./handlers/auth.js";
import { dashboardHandler } from "./handlers/dashboard.js";

import { router as payRouter } from "./routes/pay.js";
import { router as authRouter } from "./routes/auth.js";
import { router as adminRouter } from "./routes/admin.js";
import { router as loginRouter } from "./routes/login.js";
import { router as orderRouter } from "./routes/order.js";
import { router as ordersRouter } from "./routes/orders.js";
import { router as suborderRouter } from "./routes/suborders.js";

const __dirname = import.meta.dirname;

const app = express()
const port = parseInt(process.env.APP_PORT)

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'assets')))
app.use('/bootstrap_js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'pages'))

app.use('/auth', authRouter)
app.use('/login', loginRouter)

app.use('/pay', payRouter)
app.use('/order', orderRouter)
app.use('/orders', ordersRouter)
app.use('/suborders', suborderRouter)

app.use('/admin', adminRouter)

app.get('/signout', authorise, signOutHandler)

app.get('/dashboard', authorise, dashboardHandler)

app.use((req, res) => {
    return res.redirect('/dashboard')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    return res.status(500).json({
        code: 500,
        error: 'Internal Server Error'
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})