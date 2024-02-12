const mongoose = require('mongoose');

productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required: true 
    },
    description:{
        type: String,
        required:true
    },
    categories:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref:'Category',
            required:true
        }
    ],
    imageUrl:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Product',productSchema);