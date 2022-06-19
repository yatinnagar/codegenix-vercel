const User=require('../models/user');
const shortId=require('shortid')
const jsonwebtoken=require('jsonwebtoken');
// const expressjwt = require("express-jwt");
const { expressjwt: expressJwt } = require('express-jwt');


exports.signup=(req,res)=>{
    
    User.findOne({email:req.body.email}).exec((err,user)=>{
      if(user){
          return res.status(400).json({
              error:'Email is taken'
          })
      }
       const {name,email,password}=req.body
       let username=shortId.generate();
       let profile = `${process.env.CLIENT_URL}/profile/${username}`;
       let newUser=new User({
        name,email,password,username,profile
       });
       newUser.save((err,success)=>{
         if(err){
             return res.status(400).json({
                 error:err
             })
         }
         res.json({
           
             message:'sign up success! Please Login'
         })
       })
    })

}


exports.login=(req,res)=>{

    const {email,password}=req.body

    //check if user exist
      User.findOne({email}).exec((err,user)=>{
          if(err||!user)
          {
              return res.status(400).json({
                  error :"invalid email or password"
              })
          }
         if(!user.authenticate(password)){
            return res.status(400).json({
                error :"invalid email or password"
            })
         }
   
const token=jsonwebtoken.sign({_id:user._id},process.env.SECRET_KEY,{expiresIn:'10d'})
         res.cookie('token',token,{expiresIn:'10d'})
         const {_id,username,name,email,role}=user;
         return res.json({
             token,user:{_id,username,name,email,role}
         })
      }) 




    //authenticate


    //generate jwt amd send to client
}


exports.logout=(req,res)=>{
    res.clearCookie("token");
    res.json({
        mesaage:"logged out successfully"
    });

};


exports.requireSignin=expressJwt({
    secret:process.env.SECRET_KEY,
    algorithms: ["HS256"]
});

exports.authMiddleware=(req,res,next)=>{
    const authUserId=req.auth._id
    User.findById({_id:authUserId}).exec((err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error:'user not found'
            })
        }
        req.profile=user;
        next();
    })
}
exports.adminMiddleware=(req,res,next)=>{
    const adminUserId=req.auth._id
    User.findById({_id:adminUserId}).exec((err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error:'user not found'
            })
        }
        if(user.role!==1){
            return res.status(400).json({
                error:'admin resource access denied'
            })
        }
        req.profile=user;
        next();
    })
}