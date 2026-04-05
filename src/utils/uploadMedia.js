const { v2: cloudinary } = require('cloudinary')
const { createError } = require('./helperFuncs')

const uploadMedia = async (file, resourceType) => {
    try {
        if (file.mimetype.startsWith('image/')) {        
            const processedImage = Buffer.from(file.buffer)

            // Convert the image buffer to a base64 string
            const base64Image = processedImage.toString('base64')

            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(
                    `data:${file.mimetype};base64,${base64Image}`, 
                    {
                        resource_type: resourceType,
                        timeout: 600000,
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error) 
                        }
                        resolve(result) 
                    }
                )
            })

            console.log('Upload successful:', uploadResponse.url) 
            return uploadResponse.url
        } else if (file.mimetype.startsWith('video/')) {
            const base64Media = Buffer.from(file.buffer).toString("base64")
            const dataURI = `data:${file.mimetype};base64,${base64Media}`

            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(
                    dataURI,
                    {
                        resource_type: resourceType,
                        timeout: 600000,
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error)
                        }
                        resolve(result)
                    }
                )
            })

            console.log('Upload successful:', uploadResponse.url)
            return uploadResponse.url
        } else {
            throw new Error('Unsupported file type') 
        }
    } catch (err) {
        console.log(err)
        throw createError("Error uploading image", 500)
    }
}

module.exports = uploadMedia