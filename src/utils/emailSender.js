const nodemailer = require('nodemailer')
const { createError } = require('./helperFuncs')

const senderEmail = process.env.EMAIL
const senderName = "Omoba Solomon and Partners"

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: senderEmail,
        pass: process.env.EMAIL_PASS
    }
})

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to,
            subject,
            html
        })
    } catch (err) {
        console.log(err)
        throw createError("Error sending verification email", 409)
    }
}

module.exports = sendEmail