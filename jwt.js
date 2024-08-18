const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const express=require('express')
const app=express();
app.use(cookieParser());
const jwtmiddleware=(req,res,next)=>{
    //Extract jwt from request header
     const authorization=req.cookies.jwt;
     if(!authorization)  return res.json({error:"Sorry not verified"});  
    const token=req.cookies['jwt'];
    if(!token) return res.json({error:"Unauthorized"});
    try{
        //Verify token if verify done then return the payload
        const Payload=jwt.verify(token,"12345");

        //Attach user info to the requested object Basicalyy info goes to server from where request come
        req.user=Payload;
        next();
    }
    catch(err){
        res.json({error:"Invalid token"});

    }
}
const generateToken=(userData)=>{
    return jwt.sign(userData,"12345");
}


module.exports={jwtmiddleware,generateToken};