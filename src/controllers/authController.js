const bcrypt = require("bcrypt")
const User = require("../models/Users")
const { createError, generateTokenAndSetCookie } = require("../utils/helperFuncs")
const emailService = require("../utils/emailSender")

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)

const loginController = async (req, res) => {
    console.log(req.userId)
    try {
        const email = req.body.email?.toLowerCase().trim()
        const password = req.body.password?.trim()

        if (!email || !password) throw createError("Missing Inputs", 400)
        const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        if (badEmail) throw createError("Invalid email address", 400)

        const userFound = await User.findOne({ email, isVerified: true })
        if (!userFound) throw createError("Invalid email or password", 401)

        const isPasswordCorrect = await bcrypt.compare(password, userFound.password)
        if (!isPasswordCorrect) throw createError("Invalid email or password", 401)

        await generateTokenAndSetCookie(userFound._id, res)
        return res.status(200).json({ success: "Login Successful", data: { userId: userFound._id, firstname: userFound.firstname } })
    } catch (err) {
        console.log("Error in login controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const signupController = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase().trim()
        const password = req.body.password.trim()
        const firstname = req.body.firstname.trim()
        const lastname = req.body.lastname.trim()

        if (!email || !password || !firstname || !lastname) throw createError("Missing Inputs", 400)
        if (password.length < 8) throw createError("Password must be at least 8 characters", 400)
        const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        if (badEmail) throw createError("Invalid email address", 400)

        const userExists = await User.findOne({ email })

        const rawCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCode = await bcrypt.hash(rawCode, 10)
        const verificationCodeSentAt = Date.now()
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const emailBody = `
            <h3>Hello, ${firstname}!</h3>
            <p>
                Your verification code is 
                <span style="font-size: 20px; font-weight: bold; color: teal; letter-spacing: 2px;">
                ${rawCode}
                </span>
            </p>
            <p>This code will expire after 10 minutes. You can request for a new code after it expires.</p>
            <p>If you didn't sign up, you can safely ignore this email.</p>
            <br>
            <p>Best regards,<br>Omoba Solomon and Partners</p>
        `
        const tenMins = (10 * 60 * 1000)

        if (userExists) {
            if (userExists.isVerified) throw createError("Email Address is already in use", 409)
            if (Date.now() - userExists.verificationCodeSentAt < 60 * 1000 ) throw createError("Please wait before requesting another code", 429)
            
            userExists.password = hashedPassword
            userExists.firstname = firstname
            userExists.lastname = lastname
            userExists.verificationCode = verificationCode
            userExists.verificationCodeSentAt = verificationCodeSentAt
            userExists.verificationCodeExpires = verificationCodeSentAt + tenMins

            await userExists.save()
            await emailService.sendEmail(email, 'Verify your Email', emailBody)
            
            return res.status(200).json({ success: "Verification code sent", data: { email, userId: userExists._id } })
        }

        const newUser = new User({ email, password: hashedPassword, firstname, lastname, isVerified: false, 
        verificationCode, verificationCodeSentAt, verificationCodeExpires: verificationCodeSentAt + tenMins })
        await newUser.save()
        await emailService.sendEmail(email, 'Verify your Email', emailBody)

        return res.status(200).json({ success: "Verification code sent", data: { email, userId: newUser._id } })
    } catch (err) {
        console.log("Error in signup controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { verificationCode, userId } = req.body
        const email = req.body.email?.toLowerCase().trim()

        if (!email || !verificationCode) throw createError("Missing Inputs", 400)
        const badEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        if (badEmail) throw createError("Invalid email address", 400)
        if (typeof verificationCode !== "string" || verificationCode.length !== 6) throw createError("Invalid verification code", 400)

        const userFound = await User.findOne({ _id: userId, email })
        if (!userFound) throw createError("No User Found", 404)

        if (userFound.isVerified) {
            throw createError("User already verified", 400)
        }

        if (!userFound.verificationCodeExpires || userFound.verificationCodeExpires < new Date()) {
            throw createError("Verification code has expired", 400)
        }

        const doesCodeMatch = await bcrypt.compare(verificationCode, userFound.verificationCode)
        if (!doesCodeMatch) throw createError("Invalid or expired code", 400)

        userFound.isVerified = true
        userFound.verificationCode = null
        userFound.verificationCodeExpires = null
        userFound.verificationCodeSentAt = null
        await userFound.save()

        await generateTokenAndSetCookie(userFound._id, res)
        return res.status(200).json({ success: "Email verified successfully" })

    } catch (err) {
        console.log("Error in verify email controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        })
        return res.status(200).json({success: "Logged out successfully"})
    } catch (err) {
        console.log("error in logout controller", err)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

module.exports = { loginController, signupController, verifyEmail, logoutUser }