import { return400Response } from "../services/utils.js";
import { loginHandler, signUpHandler } from "../handlers/auth.js";

export async function authMiddleware(req, res) {
    const action = req.body.action
    if(action === undefined)
        return return400Response(req, res, 'Action not specified')

    if (action === 'signup')
        return await signUpHandler(req, res)
    else if (action === 'login')
        return await loginHandler(req, res)
    else
        return return400Response(req, res, 'Unknown action')
}