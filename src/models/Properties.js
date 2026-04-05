const mongoose = require('mongoose')

const requiredString = {
    type: String,
    required: true
}
const requiredNumber = {
    type: Number,
    required: true
}

const propertySchema = new mongoose.Schema({ 
    name: {
        type: String,
        enum: ["flat", "bungalow", "multi-storey", "land property", "event center", "commercial property"],
        required: true
    },
    address: requiredString,
    area: requiredString,
    city: requiredString,
    country: requiredString,
    price: requiredNumber,
    displayPic: requiredString,
    long: requiredNumber,
    lat: requiredNumber,
    pictures: {
        type: [String],
        required: true,
        default: []
    },
    amenities: {
        type: Map,
        of: String,
        default: {}
    },
    isResidential: {
        type: Boolean,
        default: false
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rent: {
        type: Boolean,
        default: true
    },
    buy: {
        type: Boolean,
        default: true
    },
    delisted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

// propertySchema.index({ area: "text", city: "text", country: "text", address: "text" }) faster search pattern but no partial matches
propertySchema.index({ buy: 1, rent: 1, delisted: 1,  })
propertySchema.index({ buy: 1, rent: 1, delisted: 1, area: 1 })
propertySchema.index({ buy: 1, rent: 1, delisted: 1, city: 1 })
propertySchema.index({ buy: 1, rent: 1, delisted: 1, country: 1 })
propertySchema.index({ buy: 1, rent: 1, delisted: 1, address: 1 })

const Property = mongoose.model("Property", propertySchema)
module.exports = Property