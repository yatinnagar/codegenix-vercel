const User=require('../models/user');
const shortId=require('shortid')
const jsonwebtoken=require('jsonwebtoken');
const { errorHandler } = require("../helpers/dbErrorHandler");
const Blog = require("../models/blog");
const mailjet =require('../mailer/email')
// const expressjwt = require("express-jwt");

const { expressjwt: expressJwt } = require('express-jwt');

const  {OAuth2Client}=require('google-auth-library')


exports.preSignup=(req,res)=>{
    const {name,email,password}=req.body;
    User.findOne({email:email.toLowerCase()}).exec((err,user)=>{
                if(user){
                    return res.status(400).json({
                        error:'Email is Taken'
                    })
                }
                const token=jsonwebtoken.sign({name,email,password},process.env.JWT_ACC_ACTIVATION,{expiresIn:'10m'});

                const request = mailjet
                    .post('send', { version: 'v3.1' })
                    .request({
                        Messages: [
                        {
                            From: {
                            Email: "yatinnagar871@gmail.com",
                            Name: "Codegenix"
                            },
                            To: [
                            {
                                Email: email,
                                Name: name
                            }
                            ],
                            Subject: "Account Activation Link",
                            TextPart: `Welcome to ${process.env.APP_NAME}, ${name}!`,
                            HTMLPart: `<h3>Dear ${name}, welcome to <a href=${process.env.CLIENT_URL}>${process.env.APP_NAME}</a>!</h3><br />
                            click the link to activate your account
                            <a href=${process.env.CLIENT_URL+"/auth/account/activate/"+token}>click here </a>
                            or you can paste the link given below
                            <br/>
                            <p>${process.env.CLIENT_URL+"/auth/account/activate/"+token}</p>
                            `
                        }
                        ]
                    })

                    request
                    .then((result) => {
                      return res.json({
                        message:`Verification has been link sent to ${email} ,check your inbox!`
                       })
                    })
                    .catch((err) => {
                       return res.status(400).json({
                        error:"Server error"
                       })
                    })

    })
}


// exports.signup=(req,res)=>{
    
//     User.findOne({email:req.body.email}).exec((err,user)=>{
//       if(user){
//           return res.status(400).json({
//               error:'Email is taken'
//           })
//       }
//        const {name,email,password}=req.body
//        let username=shortId.generate();
//        let profile = `${process.env.CLIENT_URL}/profile/${username}`;
//        let newUser=new User({
//         name,email,password,username,profile
//        });
//        newUser.save((err,success)=>{
//          if(err){
//              return res.status(400).json({
//                  error:err
//              })
//          }
//          res.json({
           
//              message:'sign up success! Please Login'
//          })
//        })
//     })

// }
exports.signup=(req,res)=>{
    const token =req.body.token;
    if(token){
        jsonwebtoken.verify(token,process.env.JWT_ACC_ACTIVATION,function(err,decoded){
            if(err){
                return res.status(401).json({
                    error:'Link expired , Sign up again.'
                })
            } 
            const {name,email,password}=jsonwebtoken.decode(token);
            let username=shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            let newUser=new User({
             name,email,password,username,profile
            });

            newUser.save((err,success)=>{
                if(err){
                    return res.status(400).json({
                        error:errorHandler(err)
                    })
                }
                res.json({
                  
                    success:'sign up success! Please Login'
                })
              })


        })
    } else {
        return res.status(400).json({
            error:'Something went wrong. Try again!'
        })
    }   
    
    }
const client =new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
exports.googleLogin=(req,res)=>{
            const idToken=req.body.tokenId;
            client.verifyIdToken({idToken,audience:process.env.GOOGLE_CLIENT_ID})
            .then(response=>{
                const {email_verified,name,email,jti}=response.payload;
                console.log(name,email,jti);
                if(email_verified){
                    User.findOne({email}).exec((err,user)=>{
                        if(user){
                            const token=jsonwebtoken.sign({_id:user._id},process.env.SECRET_KEY,{expiresIn:'1d'});
                            res.cookie('token',{expiresIn:'1d'});
                            const {_id,email,name,role,username}=user;
                            return res.json({
                                token,user:{_id,email,name,role,username}
                            });

                        } else {
                            let username=shortId.generate();
                            let profile=`${process.env.CLIENT_URL}/profile/${username}`
                            let password=jti;
                            user=new User({
                                name,email,profile,username,password
                            });

                            user.save((err,data)=>{
                                if(err){
                                    return res.status(400).json({
                                        error:errorHandler(err)
                                    })
                                }
                                const token=jsonwebtoken.sign({_id:data._id},process.env.SECRET_KEY,{expiresIn:'1d'});
                                res.cookie('token',{expiresIn:'1d'});
                                const {_id,email,name,role,username}=user;
                                return res.json({
                                token,user:{_id,email,name,role,username}
                                });
                            });
                        } 
                    });
                } else {
                    return res.status(400).json({
                        error:'Google login failed , Try again'
                    })
                }
            });
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
   
const token=jsonwebtoken.sign({_id:user._id},process.env.SECRET_KEY,{expiresIn:'1d'})
         res.cookie('token',token,{expiresIn:'1d'})
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
        message:"logged out successfully"
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

exports.canUpdateDeleteBlog=(req,res,next)=>{
    const slug=req.params.slug.toLowerCase()
    Blog.findOne({slug}).exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
              })
        }
        let authorizedUser=data.postedBy._id.toString()===req.profile._id.toString();
        if(!authorizedUser){
            return res.status(400).json({
                error:'You are not authorized'
              })
        }
        next();

    })
}