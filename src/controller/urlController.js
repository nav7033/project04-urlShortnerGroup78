const urlModel = require("../models/urlModel")
const validUrl = require('valid-url')
const shortid = require('shortid')
const redis = require('redis')
const { promisify } = require('util')
//const { redirect } = require("express/lib/response")




//Connect to redis
const redisClient = redis.createClient(
    19416,
    "redis-19416.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("KJ8YjOwgnLuCpUm3dpAoQlBltPk9kBUz", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//=========================validation function===============================
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
        if (objectKey.length === 0) {
            return res.status(400).send({ status: false, msg: "enter the longUrl in the body " })
        }
        if(!(objectKey.length==1 && objectKey == 'longUrl')){
            return res.status(400).send({ status: false, msg: "only longUrl allowed !" }) 
        }

        if (!isValid(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is required" })
        }
        if (!validUrl.isUri(data.longUrl.trim())) {
            return res.status(401).send({ status: false, msg: "longUrl is invalid" })
        }
        //check longUrl already Present or not 
        let document = await GET_ASYNC(`${req.body.longUrl}`)
        if (document) {
            return res.status(200).send({status:true,msg:"redis data", data:JSON.parse(document)})
        }
        else {
            let findDoc = await urlModel.findOne({ longUrl: data.longUrl.trim() }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })
            if (findDoc) {
                await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(findDoc))
                let urlData = {
                    longUrl: findDoc.longUrl,
                    shortUrl: findDoc.shortUrl,
                    urlCode: findDoc.urlCode
                }
                return res.status(200).send({ status: true, data: urlData })
            }
        }
        const urlCode = shortid.generate().toLowerCase()
        console.log(urlCode)
        const domain = req.protocol + '://' + req.get('host')
        const shortUrl = domain + '/' + urlCode
        console.log(shortUrl)

        let result = {
            longUrl: data.longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }
        const data1 = await urlModel.create(result)
        console.log(result)
        let urlData = {
            longUrl: data1.longUrl,
            shortUrl: data1.shortUrl,
            urlCode: data1.urlCode
        }
        return res.status(201).send({ status: true, msg: "success", data: urlData })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}
const redirectToOriginalUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        //checking urlCode present or not 
        if (!isValid(urlCode)) {
            return res.status(400).send({ status: false, msg: "urlCode is required" })
        }
        //validate urlCode valid or not
        if (Object.keys(urlCode).length !=9) {
            return res.status(400).send({ status: false, msg: "urlCode is invalid" })
        }
        //access data into cache 
        let cahcedUrl = await GET_ASYNC(`${req.params.urlCode}`)
        console.log(cahcedUrl)
        let doc = JSON.parse(cahcedUrl)
        if (doc) {
            console.log(doc)
            return res.redirect(doc.longUrl)
        }
        // find longUrl and redirect it .
        else {

            let findUrl = await urlModel.findOne({ urlCode: req.params.urlCode }).select({ _id: 0, urlCode: 1, shortUrl: 1, longUrl: 1 })
            if (!findUrl) {
                return res.status(404).send({ status: false, msg: "Url is not present in db" })
            }
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl))
            //await SET_ASYNC(`${findUrl.longUrl}`, JSON.stringify(findUrl))

            return res.redirect(findUrl.longUrl)


        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.urlCreate = urlCreate
module.exports.redirectToOriginalUrl = redirectToOriginalUrl