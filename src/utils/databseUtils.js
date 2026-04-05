const mongoose = require('mongoose')


const connectToMongodb = async () => {
    const MONGO_URI = process.env.MONGODB_CONNECTION_STRING
    try {
        await mongoose.connect(MONGO_URI)
        console.log("Connected to MongoDB")
    } catch (err) {
        console.log("Error connecting to MongoDB: ", err)
    }
}

module.exports = { connectToMongodb }