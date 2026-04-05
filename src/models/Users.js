const mongoose = require('mongoose')

const countrySchema = new mongoose.Schema({
    callingCode: String,
    code: String,
    flag: String,
    name: String,
}, { _id: false })

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    }, 
    lastname: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    country: {
        type: countrySchema,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeSentAt: {
        type: Date,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    },
    admin: {
        type: Boolean,
        default: false
    },
    agent: {
        type: Boolean,
        default: false
    },
    recents: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
        }],
        default: []
    }
}, { timestamps: true })

userSchema.index({ email: 1, isVerified: 1 })
userSchema.index({ _id: 1, email: 1 })
userSchema.index({ agent: 1, firstname: 1 })
userSchema.index({ agent: 1, lastname: 1 })
userSchema.index({ agent: 1, city: 1 })
userSchema.index({ agent: 1, country: 1 })
userSchema.index({ agent: 1 })

const User = mongoose.model("User", userSchema)
module.exports = User