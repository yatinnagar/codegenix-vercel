const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        trim:true,
        required:true,
        max:32,
        unique:true,
        index:true,
        lowercase:true
    },
    name:{
        type:String,
        trim:true,
        required:true,
        max:32,   
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true, 
        unique:true  
    },
    profile:{
        type:String,
        required:true   
    },
    hashed_password:{
        type:String,
        required:true  
    },
    salt:{
        type:Number
    },
    about:{
        type:String

    },
    role:{
        type:Number,
        default:0
    },
    photo:{
        data:Buffer,
        contentType:String
    },
    resetPasswordLink:{
        data:String,
        default:''
    }
},{timestamps:true});

userSchema.virtual('password')
   .set(function(password){
       //create a temp. variable _password
         this._password=password

       //encrypt password
       this.hashed_password=this.encryptPassword(password)
   
    })
    .get(function(){
        return this._password;
    });
userSchema.methods={
    authenticate:function(plainPass){
       return bcrypt.compareSync(plainPass, this.hashed_password);
       
    },

    encryptPassword:function(password){
        if(!password){
            return '';
        }
        try {
            const salt = bcrypt.genSaltSync(10);
            const hash =  bcrypt.hashSync(password, salt);
            
            return hash;

        } catch (error) {
            return ''
        }
    }
}


module.exports = mongoose.model('User',userSchema);
