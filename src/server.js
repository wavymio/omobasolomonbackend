const express = require('express')
const { connectToMongodb } = require('./utils/databseUtils')
const dotenv = require('dotenv/config.js')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { v2: cloudinary } = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Routers' Importation
const authRouter = require("./routes/authRoute")
const myUserRouter = require("./routes/myUserRoute")
const userRouter = require("./routes/userRoute")
const propertyRouter = require("./routes/propertyRoute")
const agentRouter = require("./routes/agentRoute")

// start app
const app = express()

// middleware
const allowedOrigins = [process.env.FRONTEND_URL, process.env.DOMAIN_NAME]
app.use(cors({
    origin: function (origin, callback) {
        // console.log("Origin header:", origin)
        // console.log("Allowed origins:", allowedOrigins)
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))
app.use(express.json({ limit: '600kb' }))
app.use(cookieParser())

// routes
app.use("/api/auth", authRouter)
app.use("/api/my/user", myUserRouter)
app.use("/api/user", userRouter)
app.use("/api/properties", propertyRouter)
app.use("/api/agents", agentRouter)

// health
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: "I am healthy" })
})

app.listen(8080, async () => {
    await connectToMongodb()
    console.log("App started successfully")
})