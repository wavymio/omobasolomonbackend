const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

const createError = (message, status) => {
    const error = new Error(message)
    error.statusCode = status
    error.artificial = true
    return error
}

const generateTokenAndSetCookie = async (userId, res) => {
    try { 
        const token = jwt.sign({ userId }, jwtSecret, {
            expiresIn: '15d'
        })

        res.cookie("jwt", token, {
            maxAge: 15 * 24 * 60 * 1000,
            httpOnly: true,
            // sameSite: 'lax',
            // secure: false,
            secure: true,
            sameSite: "none",
            path: "/"
        })

        // console.log('Cookie set successfully')
    } catch (err) {
        throw createError("Error setting cookie", 500)
    }
}



module.exports = { createError, generateTokenAndSetCookie }