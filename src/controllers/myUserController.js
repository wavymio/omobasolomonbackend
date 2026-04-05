const { default: mongoose } = require("mongoose")
const User = require("../models/Users")
const { createError } = require("../utils/helperFuncs")
const uploadMedia = require("../utils/uploadMedia")
const { default: parsePhoneNumberFromString } = require("libphonenumber-js")
const { Favourite } = require("../models/Favourites")

const getMyUser = async (req, res) => {
    try {
        const { userId } = req
        
        const user = await User.findById(userId)
        .populate({
            path: "recents",
            select: "-createdAt -updatedAt -__v",
            populate: {
                path: "agent",
                select: "email firstname lastname country city phone profilePicture"
            }
        })
        .select("-password -createdAt -updatedAt -__v -verificationCode -verificationCodeSentAt -verificationCodeExpires")
        if (!user) throw createError("No user found", 404)

        return res.status(200).json({ success: "User retrieved successfully", data: user })
        
    } catch (err) {
        console.log("Error in get my user controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const getMyFavourites = async (req, res) => {
    try {
        const { userObjectId } = req
        
        const myFavourites = await Favourite.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .populate({
            path: "propertyId",
            select: "-createdAt -updatedAt -__v",
            populate: {
                path: "agent",
                select: "email firstname lastname country city phone profilePicture"
            }
        })
        .select("-updatedAt -__v -userId")
        .lean()

        return res.status(200).json({ success: "User favourites retrieved successfully", data: myFavourites })
        
    } catch (err) {
        console.log("Error in get my favourites controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const updatePfp = async (req, res) => {
    try {
        const { userId } = req

        const user = await User.findById(userId)
        if (!user) throw createError("No user found", 404)

        const image = req.file
        if (!image) throw createError("No file found", 400)

        const profilePicture = await uploadMedia(image, "image")
        
        user.profilePicture = profilePicture
        await user.save()

        return res.status(201).json({ success: "Profile Picture Updated" })
    } catch (err) {
        console.log("Error in update pfp controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const updateUserData = async (req, res) => {
    try {
        const firstname = req.body.firstname.trim()
        const lastname = req.body.lastname.trim()
        const city = req.body.city ? req.body.city.trim() : null
        const country = req.body.country ?? null
        const phone = req.body.phone ? req.body.phone.trim() : null 

        if (!firstname || !lastname) throw createError("Missing Inputs", 400)
        if (phone) {
            if (!country?.code || !country?.name) throw createError("No country specified", 400)
            const testNumber = parsePhoneNumberFromString(phone, country.code)
            if (!testNumber.isValid) throw createError("Invalid Phone Number", 400) 
        }

        const { userId } = req

        const user = await User.findById(userId)
        if (!user) throw createError("No user found", 404)

        user.firstname = firstname
        user.lastname = lastname
        user.city = city
        user.country = country
        user.phone = phone
        await user.save()

        return res.status(201).json({ success: "User Updated" })
    } catch (err) {
        console.log("Error in update user data controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

module.exports = { getMyUser, updatePfp, updateUserData, getMyFavourites }