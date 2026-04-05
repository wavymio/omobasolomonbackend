const { default: mongoose } = require("mongoose")
const Property = require("../models/Properties")
const sendEmail = require("../utils/emailSender")
const { createError } = require("../utils/helperFuncs")
const User = require("../models/users")

const contactAgent = async (req, res) => {
    try {
        const email = req.body.email.trim()
        const message = req.body.message.trim()
        const firstname = req.body.firstname.trim()
        const lastname = req.body.lastname.trim()
        const city = req.body.city ? req.body.city.trim() : null
        const country = req.body.country ?? null
        const phone = req.body.phone ? req.body.phone.trim() : null 
        const propertyId = req.body.propertyId

        if (!firstname || !lastname || !email || !message || !propertyId) throw createError("Missing Inputs", 400)
        if (!mongoose.Types.ObjectId.isValid(propertyId)) throw createError("Invalid Property ID format", 400)
        if (phone) {
            if (!country?.code || !country?.name) throw createError("No country specified", 400)
            const testNumber = parsePhoneNumberFromString(phone, country.code)
            if (!testNumber.isValid) throw createError("Invalid Phone Number", 400) 
        }

        const property = await Property.findById(propertyId).select("-createdAt -updatedAt -__v")
        .populate("agent", "email firstname lastname country city phone profilePicture")
        if (!property) throw createError("No property found", 404)

        const agent = property.agent
        const propertyLink = `${process.env.FRONTEND_URL}/properties/${propertyId}`
        const emailBody = `
            <h3>Hello, ${agent.firstname}, you have a new message from ${lastname} ${firstname}</h3>
            <p style="letter-spacing: 1.1px;>Sender's Message: <span style="color: teal; letter-spacing: 1.1px;">"${message}"</span></p>
            <p style="letter-spacing: 1.1px;>Sender's Email: <span style="color: teal; letter-spacing: 1.1px;">${email}</span></p>
            <p style="letter-spacing: 1.1px;>Sender's Phone: <span style="color: teal; letter-spacing: 1.1px;">${phone ? phone : 'N/A'}</span></p>
            <p style="letter-spacing: 1.1px;>Sender's City: <span style="color: teal; letter-spacing: 1.1px;">${city ? city : 'N/A'}</span></p>
            <p style="letter-spacing: 1.1px;>Sender's Country: <span style="color: teal; letter-spacing: 1.1px;">${country ? country : 'N/A'}</span></p>
            <br>
            <p style="letter-spacing: 1.1px;>Click <a href="${propertyLink}" style="color: teal; letter-spacing: 1.1px;">here</a> to view the property</p>
            <p style="letter-spacing: 1.1px;>Best regards,<br>Omoba Solomon and Partners</p>
        `

        await sendEmail(agent.email, `New Message from ${lastname} ${firstname} on OmobaSolomonandPartners.com`, emailBody)
        return res.status(201).json({ success: "Email Sent Successfully" })
    } catch (err) {
        console.log("Error in contact agent controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const requestListing = async (req, res) => {
    try {
        const email = req.body.email.trim()
        const message = req.body.message.trim()

        if (!email || !message) throw createError("Missing Inputs", 400)

        const emailBody = `
            <h3>Hello Admin, Someone sent a Listing Request</h3>
            <p style="letter-spacing: 1.1px;">Sender's Message: <span style="color: teal; letter-spacing: 1.1px;">"${message}"</span></p>
            <p style="letter-spacing: 1.1px;">Sender's Email: <span style="color: teal; letter-spacing: 1.1px;">${email}</span></p>
            <br>
            <p style="letter-spacing: 1.1px;">Best regards,<br>Omoba Solomon and Partners</p>
        `

        await sendEmail(process.env.COMPANY_EMAIL, `Property Listing Request on OmobaSolomonandPartners.com`, emailBody)
        return res.status(201).json({ success: "Email Sent Successfully" })
    } catch (err) {
        console.log("Error in requestListing controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const requestHelp= async (req, res) => {
    try {
        const email = req.body.email.trim()
        const message = req.body.message.trim()

        if (!email || !message) throw createError("Missing Inputs", 400)

        const emailBody = `
            <h3>Hello Admin, someone sent a Help Request</h3>
            <p style="letter-spacing: 1.1px;">Sender's Message: <span style="color: teal; letter-spacing: 1.1px;">"${message}"</span></p>
            <p style="letter-spacing: 1.1px;">Sender's Email: <span style="color: teal; letter-spacing: 1.1px;">${email}</span></p>
            <br>
            <p style="letter-spacing: 1.1px;">Best regards,<br>Omoba Solomon and Partners</p>
        `

        await sendEmail(process.env.COMPANY_EMAIL, `Help Request on OmobaSolomonandPartners.com`, emailBody)
        return res.status(201).json({ success: "Email Sent Successfully" })
    } catch (err) {
        console.log("Error in requestHelp controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const getAgents = async (req, res) => {
    try {
        const { search } = req.query

        let query = { agent: true }

        if (search) {
            const searchTerm = search.toLowerCase().trim()

            query = {
                $and: [
                    { agent: true },
                    {
                        $or: [
                            { firstname: { $regex: searchTerm, $options: "i" } },
                            { lastname: { $regex: searchTerm, $options: "i" } },
                            { city: { $regex: searchTerm, $options: "i" } },
                        ]
                    }
                ]
            }
        }

        const agents = await User.find(query).select("email firstname lastname country city phone profilePicture").lean()

        return res.status(200).json({ success: "Properties retrieved successfully", data: agents })
    } catch (err) {
        console.log("Error in getAgents controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

module.exports = { contactAgent, getAgents, requestListing, requestHelp }