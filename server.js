const express=require('express');
const morgan=require('morgan');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const mongoose=require('mongoose');
require('dotenv').config();

//Routes import
const blogRoutes=require('./routes/blog');
const authRoutes=require('./routes/auth');
const userRoutes=require('./routes/user');
const categoryRoutes=require('./routes/category');
const tagRoutes=require('./routes/tag');



//app

const app=express();


mongoose.connect(process.env.DATABASE,{useNewUrlParser:true}).then(()=>{
    console.log("database connected");
})

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

//cors
if(process.env.NODE_ENV==='development'){
    app.use(cors({origin:`${process.env.CLIENT_URL}`}));
}


//routes middlewares
app.use('/api',blogRoutes);
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);
app.use('/api',tagRoutes);


// app.use()
//port
const port=process.env.PORT||4000;

app.listen(port,()=>{
       console.log("listening on port "+port);
})
