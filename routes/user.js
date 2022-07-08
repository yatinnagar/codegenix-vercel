const express=require('express');
const router=express.Router();
const {requireSignin,authMiddleware,adminMiddleware}= require('../controllers/auth');
const {read,publicProfile,editProfile,getPhoto}= require('../controllers/user')


router.get('/user/profile',requireSignin,authMiddleware,read)
router.get('/user/:username',publicProfile)
router.put('/user/edit',requireSignin,authMiddleware,editProfile)
router.get('/user/photo/:username',getPhoto)



module.exports=router;