const mongoose = require('mongoose')



const urlSchema = new mongoose.Schema({
    urlCode:{
        type:String,
        unique:true,
        required:[true,"require urlCode"],
        lowercase:true,
        trim:true

    },
    longUrl:{
        type:String,
        required:[true,'required longUrl'],
        validate: {
            validator: function (longUrl) {
                return  !/((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/.test(longUrl)
            },
            message: 'Please fill a valid url',
            isAsync: false
        },
        trim:true

        
    },
    shortUrl:{
        type:String,
        required:[true,"required shortUrl"],
        unique:true,
        lowercase:true,
        trim:true
    }
},{timestamps:true})

module.exports = mongoose.model('urlCollection',urlSchema)