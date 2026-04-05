const express = require('express')
const { getProperties, getProperty, likeProperty, unlikeProperty, addPropertyToRecents } = require('../controllers/propertyController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router()

router.get('/', getProperties)
router.get('/:propertyId', getProperty)
router.post('/:propertyId/like', verifyToken, likeProperty)
router.post('/:propertyId/unlike', verifyToken, unlikeProperty)
router.post('/:propertyId/addtorecents', verifyToken, addPropertyToRecents)

module.exports = router