const express = require('express')
const { contactAgent, getAgents, requestListing, requestHelp } = require('../controllers/agentController')
const router = express.Router()

router.post('/contact', contactAgent)
router.post('/listing/request', requestListing)
router.post('/help/request', requestHelp)
router.get('/', getAgents)

module.exports = router