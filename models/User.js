const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Question = require('./Question');

const UserSchema = new Schema({

    name : {
        type: String,
        required: [true,"Please provide a name"]
    },
    email : {
        type: String,
        required: [true,"Please provide a email"],
        unique: [true,"Please try different email"],
        match:  [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Please provide a valid email"
        ]
    },
    role : {
        type: String,
        default: "user",
        enum : ["user","admin"]
    },
    password : {
        type: String,
        minlength: [6,"Please provide a password with min length 6"],
        required: [true,"Please provide a password"],
        select: false 
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    title : {
        type:String
    },
    about : {
        type: String
    },
    place : {
        type: String
    },
    website : {
        type: String
    },
    profile_image : {
        type: String,
        default: "default.jpg"
    },
    blocked : {
        type: Boolean,
        default: false
    },
    resetPasswordToken : {
        type: String
    },
    resetPasswordExpire : {
        type: Date
    }
});
//userschema methods

UserSchema.methods.generateJwtFromUser = function(){    
    const { JWT_SECRET_KEY,JWT_EXPIRE} = process.env;
    const payload = {
        id: this.id,
        name: this.name
    }

    const token = jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn: JWT_EXPIRE
    });
    return token;
}

UserSchema.methods.getResetPasswordTokenFromUser = function(){
    const randomHex = crypto.randomBytes(15).toString("hex");
    const { RESET_PASSWORD_EXPIRE} = process.env;
    const resetPasswordToken = crypto
    .createHash('SHA256')
    .update(randomHex)
    .digest('hex')

    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + Number(RESET_PASSWORD_EXPIRE);

    return resetPasswordToken;
}


UserSchema.pre("save",function(next){
    if(!this.isModified("password")){
        next();
    }
    bcrypt.genSalt(10,(err, salt) => {
        if(err) next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if(err) next(err);
            this.password = hash;
            next();
        });
    });
});

UserSchema.pre("remove",async function(){
    await Question.deleteMany({
        user: this._id
    })
});

module.exports = mongoose.model("User",UserSchema);