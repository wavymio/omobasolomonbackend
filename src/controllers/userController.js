const { default: mongoose } = require("mongoose")
const User = require("../models/Users")
const { createError } = require("../utils/helperFuncs")

const getUser = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) throw createError("No Id received", 400)
        if (!mongoose.Types.ObjectId.isValid(userId)) throw createError("Invalid User ID format", 400)

        const user = await User.findById(userId)
        .select("email firstname lastname country city phone profilePicture isVerified")

        if (!user || !user.isVerified) throw createError("No user found", 404)
        
        return res.status(200).json({ success: "User retrieved successfully", data: user })
    }  catch (err) {
        console.log("Error in getUser controller: ", err)
        return res.status(err.artificial ? err.statusCode : 500).json({ error: err.artificial ? err.message : "Internal Server Error" })
    }
}

module.exports = { getUser }