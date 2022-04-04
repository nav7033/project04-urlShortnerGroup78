const express = require('express')
const router = express.Router()
const urlController = require('../controller/urlController')


router.post('/shorten',urlController.creatShortUrl)

router.post('/url/shorten',urlController.urlCreate)
router.get('/:urlCode',urlController.redirectToOriginalUrl)









module.exports = router