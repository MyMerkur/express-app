const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
        require:true
    },
    person:{
        type:Number,
        required:true
    },
    isSubmit:{
        type:Boolean,
        default:false
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}) 

module.exports = mongoose.model('Reservation',reservationSchema);