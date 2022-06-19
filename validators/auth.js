 const {check} =require('express-validator');

 exports.userSignupValidator=[
     check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
     check('email')
        .isEmail()
        .withMessage('Email address must be valid'),
    check('password')
        .isLength({min:6})
        .withMessage('Password must be 6 characters long'),
    ]

    
 exports.userLoginValidator=[
    check('email')
       .isEmail()
       .withMessage('Email address must be valid'),
   check('password')
       .isLength({min:6})
       .withMessage('Password must be 6 characters long'),
   ]