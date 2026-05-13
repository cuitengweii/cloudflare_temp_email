import { Context } from 'hono';
import { Jwt } from 'hono/utils/jwt'

import i18n from '../i18n';
import utils, { checkCfTurnstile } from "../utils"

const EMPLOYEE_SELF_RESET_DISABLED_MSG = "Forgot password is disabled. Please contact your administrator to reset your password.";

export default {
    verifyCode: async (c: Context<HonoCustomType>) => {
        return c.text(EMPLOYEE_SELF_RESET_DISABLED_MSG, 403)
    },
    register: async (c: Context<HonoCustomType>) => {
        return c.text(EMPLOYEE_SELF_RESET_DISABLED_MSG, 403)
    },
    login: async (c: Context<HonoCustomType>) => {
        const { email, password, cf_token } = await c.req.json();
        const msgs = i18n.getMessagesbyContext(c);
        if (!email || !password) return c.text(msgs.InvalidEmailOrPasswordMsg, 400);
        // check cf turnstile if global turnstile is enabled
        if (utils.isGlobalTurnstileEnabled(c)) {
            try {
                await checkCfTurnstile(c, cf_token);
            } catch (error) {
                return c.text(msgs.TurnstileCheckFailedMsg, 400)
            }
        }
        const { id: user_id, password: dbPassword } = await c.env.DB.prepare(
            `SELECT id, password FROM users where user_email = ?`
        ).bind(email).first() || {};
        if (!dbPassword) {
            return c.text(msgs.UserNotFoundMsg, 400)
        }
        // TODO: need check password use random salt
        if (dbPassword != password) {
            return c.text(msgs.InvalidEmailOrPasswordMsg, 400)
        }
        // create jwt
        const jwt = await Jwt.sign({
            user_email: email,
            user_id: user_id,
            // 90 days expire in seconds
            exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            iat: Math.floor(Date.now() / 1000),
        }, c.env.JWT_SECRET, "HS256")
        return c.json({
            jwt: jwt
        })
    },
}
