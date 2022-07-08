
const mailgun = require("mailgun-js");

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});



exports.contactForm=(req,res)=>{
    // console.log(req.body)
    const {name,email,message}=req.body;
    const data = {
        from: `${email}`,
        to: 'yatinagar96@gmail.com',
        subject: `Contact Form - ${process.env.APP_NAME}`,
        html: `
        <h4>Email received from contact form : </h4>
        <p>Sender name: ${name}</p>
        <p>Sender email: ${email}</p>
        <p>Sender message: ${message}</p>
        <hr/>
        
        `
    };
    
mg.messages().send(data, function (error, body) {
 
    if(error){
        return res.json({
            success:false
        })
    }
    console.log(body);
    return res.json({
        
        success:true
    })
});
   
}

exports.contactBlogAuthorForm=(req,res)=>{

    const {authorEmail,name,email,message}=req.body;
    const data = {
        from: `${email}`,
        to: authorEmail,
        subject: `Someone messaged you from ${process.env.APP_NAME}`,
        html: `
        <h3>Message received form : </h3>
        <p> name: ${name}</p>
        <p> email: ${email}</p>
        <p> message: ${message}</p>
        <hr/>
        
        `
    };
    
            mg.messages().send(data, function (error, body) {
            
                if(error){
                    console.log(error)
                    return res.json({
                        success:false
                    })
                }
                console.log(body);
                return res.json({
                    
                    success:true
                })
            });
   
}

