const express = require('express')
const { loginController, signupController, verifyEmail, logoutUser } = require('../controllers/authController')
const verifyToken = require('../middleware/verifyToken')
const router = express.Router()

router.post('/login', loginController)
router.post('/signup', signupController)
router.post('/verify', verifyEmail)
router.get('/logout', verifyToken, logoutUser)

module.exports = router