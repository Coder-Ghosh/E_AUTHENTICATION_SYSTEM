const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const Userschema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    phoneno:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
});


Userschema.pre('save',async function(next){
    const person=this;

    //Hash the password only if it is modified or new
    if(!person.isModified('password'))
    {
        return next();
    }
    try {
        //hash password generation
        const salt= await bcrypt.genSalt(10);

        //hash password
        const hassedpassword=await bcrypt.hash(person.password,salt);

        person.password=hassedpassword;
        next();
    } catch (err){

        return next(err);
    } 
    

})
Userschema.methods.comparePassword=async function(pass)
{
    try{
//use bcrypt to compare the provided password with the hashed password
        const isMatch=await bcrypt.compare(pass,this.password);
        return isMatch;
    }
    catch(err)
    {
        throw err;

    }
}



//Create User model
const Users=mongoose.model('Users',Userschema);
module.exports=Users;