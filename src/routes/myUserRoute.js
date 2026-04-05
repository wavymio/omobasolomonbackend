const express = require('express')
const verifyToken = require('../middleware/verifyToken')
const { getMyUser, updatePfp, updateUserData, getMyFavourites } = require('../controllers/myUserController')
const upload = require('../middleware/multerParse')
const router = express.Router()

router.get('/', verifyToken, getMyUser)
router.get('/favourites', verifyToken, getMyFavourites)
router.patch('/pfp', verifyToken, upload.single("profilePicture"), updatePfp)
router.patch('/info', verifyToken, updateUserData)

module.exports = router