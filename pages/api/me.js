import { runMiddleware } from "../../helper/middleware"
import { isLoggedIn } from "../../middlewares/auth"


// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async(req, res) => {
    var params = await runMiddleware(req, res, isLoggedIn({}))
    console.log(params)

    res.statusCode = 200
    res.json(params.user)
}