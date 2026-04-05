const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const { createError } = require('../utils/helperFuncs')
const jwtSecret = process.env.JWT_SECRET

const verifyToken = (req, res, next) => {
    try {
        const jwtToken = req.cookies.jwt      
        if (!jwtToken) throw createError("Unauthorized", 401)

        const decoded = jwt.verify(jwtToken, jwtSecret)
        if (!decoded) throw createError("Unauthorized", 401)

        const userObjectId = new mongoose.Types.ObjectId(decoded.userId)

        req.userId = decoded.userId
        req.userObjectId = userObjectId
        next()
    } catch (err) {
        console.log("Error in verify token middleware: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

module.exports = verifyToken