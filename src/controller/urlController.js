const urlModel = require("../models/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')


const isValid = function (value) {
    if (typeof value == 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
}



//==================URL CREATE=========================================
const urlCreate = async function (req, res) {
    
    try {
        const data = req.body
        const objectKey = Object.keys(data)
        if (objectKey.length > 0) {
            if ((objectKey.length != 1 && objectKey != 'longUrl')) {
                return res.status(400).send({ status: false, msg: "only longUrl link is allowed !" })
            }
        }

        if (!isValid(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is required" })
        }
        if (!validUrl.isUri(data.longUrl)) {
            return res.status(401).send({ status: false, msg: "longUrl is invalid" })
        }
        const urlCode1 = shortid.generate()
        if (!isValid(urlCode1)) {
            return res.status(400).send({ status: false, msg: "urlCode is required" })
        }
        console.log(urlCode1)
        const domain = req.protocol + '://' + req.get('host')
        const shortUrl1 = domain + '/' + urlCode1
        console.log(shortUrl1)
        if (!isValid(shortUrl1)) {
            return res.status(400).send({ status: false, msg: "shortUrl is required" })
        }


        data.urlCode = urlCode1;
        data.shortUrl = shortUrl1;


        const data1 = await urlModel.create(data)
        const result = {
            longUrl: data1.longUrl,
            shortUrl: data1.shortUrl,
            urlCode: data1.urlCode
        }

        return res.status(201).send({ status: true, msg: "success", data:result })



    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}
const redirectToOriginalUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        if (urlCode.length != 9) {
            return res.status(400).send({ status: false, msg: "this is a invalid urlCode" })

        }
        const findUrl = await urlModel.findOne({ urlCode: urlCode })
        if (!findUrl) {
            return res.status(404).send({ status: false, msg: "Url not found" })
        }
        return res.redirect(301, findUrl.longUrl )
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.urlCreate = urlCreate
module.exports.redirectToOriginalUrl = redirectToOriginalUrl