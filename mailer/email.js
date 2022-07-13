const Mailjet = require('node-mailjet');
require('dotenv').config();
 const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILGUN_API_SECRET 
  });
  module.exports=mailjet;