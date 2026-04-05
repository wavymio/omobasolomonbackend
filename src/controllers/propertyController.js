const { default: mongoose } = require("mongoose")
const Property = require("../models/Properties")
const { createError } = require("../utils/helperFuncs")
const { Favourite } = require("../models/Favourites")
const User = require("../models/Users")

const getProperties = async (req, res) => {
    try {
        const { search, buy, rent, delisted, name, isResidential, minPrice, maxPrice } = req.query
        let query = {}

        if (buy) query.buy = buy === "true"
        if (rent) query.rent = rent === "true"
        if (delisted) query.delisted = delisted === "true"
        if (name) query.name = name
        if (isResidential) query.isResidential = isResidential === "true"
        if (minPrice || maxPrice) {
            query.price = {
                ...(minPrice ? { $gte: Number(minPrice) } : {}),
                ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
            }
        }

        if (search) {
            const searchTerm = search.toLowerCase().trim()

            query.$or = [
                { area: { $regex: `${searchTerm}`, $options: "i" } },
                { city: { $regex: `${searchTerm}`, $options: "i" } },
                { country: { $regex: `${searchTerm}`, $options: "i" } },
                { address: { $regex: `${searchTerm}`, $options: "i" } },
            ]
        }

        console.log({ query })

        const properties = await Property.find(query).select("-createdAt -updatedAt -__v")
        .populate("agent", "email firstname lastname country city phone profilePicture")

        return res.status(200).json({ success: "Properties retrieved successfully", data: properties })
        
    } catch (err) {
        console.log("Error in get properties controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const getProperty = async (req, res) => {
    try {
        const { propertyId } = req.params
        if (!propertyId) throw createError("No Id received", 400)
        if (!mongoose.Types.ObjectId.isValid(propertyId)) throw createError("Invalid Property ID format", 400)

        const property = await Property.findById(propertyId).select("-createdAt -updatedAt -__v")
        .populate("agent", "email firstname lastname country city phone profilePicture")

        if (!property) throw createError("No property found", 404)
        
        return res.status(200).json({ success: "Property retrieved successfully", data: property })
    } catch (err) {
        console.log("Error in get a property controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const likeProperty = async (req, res) => {
    try {
        const { userObjectId } = req
        const { propertyId } = req.params

        if (!propertyId) throw createError("No Id received", 400)
        if (!mongoose.Types.ObjectId.isValid(propertyId)) throw createError("Invalid Property ID format", 400)
        
        try {
            const addedProperty = await Favourite.create({ userId: userObjectId, propertyId })
            return res.status(201).json({ success: "Added to Favourites", data: addedProperty })
        }  catch (err) {
            if (err.code === 11000) throw createError("Already added to Favourites", 409)
            else throw err 
        }
        
    } catch (err) {
        console.log("Error in likeProperty controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const unlikeProperty = async (req, res) => {
    try {
        const { userObjectId } = req
        const { propertyId } = req.params

        if (!propertyId) throw createError("No Id received", 400)
        if (!mongoose.Types.ObjectId.isValid(propertyId)) throw createError("Invalid Property ID format", 400)
        
        const deletedProperty = await Favourite.findOneAndDelete({ userId: userObjectId, propertyId })
        if (!deletedProperty) return res.status(200).json({ success: "Already removed from favourites" })

        return res.status(201).json({ success: "Removed from Favourites", data: deletedProperty })
    } catch (err) {
        console.log("Error in unlikeProperty controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

const addPropertyToRecents = async (req, res) => {
    try {
        const { userObjectId } = req
        const { propertyId } = req.params

        if (!propertyId) throw createError("No Id received", 400)
        if (!mongoose.Types.ObjectId.isValid(propertyId)) throw createError("Invalid Property ID format", 400)
        
        const updatedUser = await User.findByIdAndUpdate(
            userObjectId,
            { $pull: { recents: propertyId } }, // Remove if exists
            { new: true }
        )
        if (!updatedUser) throw createError("No user found", 404)

        await User.findByIdAndUpdate(userObjectId, {
            $push: {
                recents: {
                    $each: [propertyId],
                    $position: 0,
                    $slice: 10 
                }
            }
        })

        return res.status(201).json({ success: "Added to Recents" })
    } catch (err) {
        console.log("Error in addPropertyToRecents controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

module.exports = { getProperties, getProperty, likeProperty, unlikeProperty, addPropertyToRecents }