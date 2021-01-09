import { getSession } from "next-auth/client";
/**
 * 
 * @param {*} params 
 * 
 * @returns user
 */
const isLoggedIn = (params) => {
    return async(req, res, next) => {
        const session = await getSession({ req })
        if (session && session.user) {
            params.user = session.user;
            next(params);
        } else {
            res.status(401).json({
                message: 'You are not logged in'
            })
        }
    }
}

export { isLoggedIn };