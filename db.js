//This file is responsible for setup database connectivity

const mongoose=require('mongoose');
console.log(process.env.DB_LINK);
//Define mogodb connection URL
const mongoURL=process.env.DB_LINK

//Setup mongodb connection

mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


//Get the default connection
//Mongoose maintain a default connection object  representing the mongodb connection
const db=mongoose.connection;

db.on('connected',()=>{
    console.log("Connected to mongodb server");
})

db.on('error',(err)=>{
    console.error("error:",err);
})

db.on('disconnected',()=>{
    console.log("Setup is disconnected");
})

module.exports=db;