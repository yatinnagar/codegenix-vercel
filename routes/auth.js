const express=require('express');
const router=express.Router();
const {signup,login, logout,requireSignin}= require('../controllers/auth')

//validators
const {runValidation}=require('../validators/index')
const {userSignupValidator,userLoginValidator}=require('../validators/auth')

router.post('/signup',userSignupValidator,runValidation,signup);
router.post('/login',userLoginValidator,runValidation,login);
router.get('/logout',logout)


//test
// router.get('/secret',requireSignin,(req,res)=>{
//     console.log(req)
    
//     res.json(
//      { user:req.auth}
       
//     )
// })

module.exports=router;