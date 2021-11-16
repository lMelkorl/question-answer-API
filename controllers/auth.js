const User = require("../models/User");
const {sendJwtToClient} = require("../helpers/authorization/tokenHelper");
const asyncErrorWrapper = require('express-async-handler');
const CustomError = require("../helpers/error/CustomError");
const {validateUserInput,comparePassword} = require('../helpers/inputs/inputhelper');
const sendEmail = require('../helpers/libraries/sendEmail');

const register = asyncErrorWrapper(async(req,res,next) => {    
    const {name,email,password,role} = req.body;
    const createUser = await User.create({
        name,
        email,
        password,
        role
    });
    sendJwtToClient(createUser,res);
});

const login = asyncErrorWrapper(async(req,res,next) => {  

    const { email,password} = req.body;
    if(!validateUserInput(email,password)){
        return next(new CustomError("Please check your input",400));
    }
    
    const user = await User.findOne({email}).select("+password");

    // if(user.blocked === true){
    //     return next(new CustomError("You are Blocked.",400));
    // }

    if(!comparePassword(password,user.password)){
        return next(new CustomError("Please check your credentails",400));
    }
    sendJwtToClient(user,res);
});

const logout = asyncErrorWrapper(async(req,res,next) => {  
   const { NODE_ENV} = process.env;

    return res
    .status(200)
    .cookie({
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: NODE_ENV === "development" ? false : true
    })
    .json({
        success: true,
        message: "Logout Successfuly"
    })
});


const getUser = (req,res,next) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            name: req.user.name
        }
    })
}

const imageUpload = asyncErrorWrapper(async(req,res,next) => {  

    const user = await User.findByIdAndUpdate(req.user.id,{
        "profile_image": req.savedProfileImage
    },{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success:true,
        message: "image upload is succesful.",
        data: user
    })
});

const forgotPassword = asyncErrorWrapper(async(req,res,next) => {  
    const resetEmail = req.body.email;

    const user = await User.findOne({email: resetEmail});

    if(!user){
        return next(new CustomError("There is no user with that email."));
    }

    const resetPasswordToken = user.getResetPasswordTokenFromUser();

    await user.save();

    const resetPasswordUrl = `http://localhost:3000/api/auth/resetPassword?resetPasswordToken=${resetPasswordToken}`;

    const emailTemplate = `
    <h3>Reset Your Password</h3>
    <p>This <a href='${resetPasswordUrl}' target='_blank'>Link</a>will expire in 1 hour.</p>
    `;

    try{
        await sendEmail({
            from: process.env.SMTP_USER,
            to: resetEmail,
            subject: "Reset Your Password.",
            html: emailTemplate
        });
        return res.status(200).json({
            success:true,
            message: "Token sent your Email."
        })
    }
    catch(err){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        return next(new CustomError("Email cloud not be Sent",500));
    }
});

const resetPassword = asyncErrorWrapper(async(req,res,next) => {  

    const {resetPasswordToken} = req.query;
    const {password} = req.body;

    if(!resetPasswordToken){
        return  next(new CustomError("Please provide a valid token",400));
    }

    let user = await User.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {$gt : Date.now()}
    });

    if(!user){
        return next(new CustomError("invalid token or session expired",404));
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200)
    .json({
        success: true,
        message: "Your Reset Password is succesful."
    })
});

const editDetails = asyncErrorWrapper(async (req,res,next) =>{
    const editInformation = req.body;

    const user = await User.findByIdAndUpdate(req.user.id,editInformation,{
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    register,
    getUser,
    login,
    logout,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
}