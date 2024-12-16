const mongoose = require('mongoose');
const { Schema } = mongoose;
// creating a schema for notes
const UserSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tag:{
        type:String,
        // required:true
        default:'General'
    },
    date:{
        type:Date,
        default:Date.now
    },
})
const Notes = mongoose.model('notes',UserSchema);
module.exports = Notes;