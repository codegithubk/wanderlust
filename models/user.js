const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    //name
    //username and password are provided by passport-local-mongoose(default)
});

//const User = mongoose.model("User", userSchema);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);



//passport-local-mongoose also adds some methods to your Schema
//like instance method(setpassword, changepassword,authenticate,.....)
//static method(authenticate(), serializeuser(), deserializeuser(), register())