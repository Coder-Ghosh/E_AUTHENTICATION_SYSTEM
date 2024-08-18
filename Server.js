const express=require('express')
const app=express();
const cors = require('cors');
const path=require('path');
const db=require('./db');
const session = require('express-session')
const User=require('./models/User');
const bodyParser=require('body-parser');
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const ejs=require("ejs");
const cookieParser=require('cookie-parser');
const {jwtmiddleware,generateToken}=require('./jwt');

const multer=require('multer');

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());

const encoding=express.urlencoded({extended:true})

app.use(session({
    secret: "secret",
    resave: false ,
    saveUninitialized: false 
  }))
  // This is the basic express session({..}) initialization.
     
  app.set("view engine","ejs");


 
  
  const storage=multer.diskStorage({
      destination:(req,res,next)=>{
                  next(null,path.join(__dirname,'public/images'))
      },
      filename:(req,res,next)=>{
           const name=Date.now()+'-'+res.filename;
           next(null,name);
  
      }
  })
  const upload=multer({storage:storage });



passport.use(new LocalStrategy(async (username,password,done)=>{
    try{
        const user=await User.findOne({username:username});
        console.log(user);
        if(!user)    return done(null,false);
         //if(user.password!==password)  return done(null,false); 
        const matchpwd=await user.comparePassword(password)
        console.log(matchpwd);
        if(!matchpwd)  return done(null,false);
    
        return done(null,user);
    }
    catch(err)
    {
        return done(err,false);
    }


}))
passport.serializeUser( (user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try{
        const user=await User.findById(id); 
    done (null, user);
    }
    catch(err){
        done(err,false);
    }
})

app.use(passport.initialize());
  app.use(passport.session()) 




app.get('/signin',(req,res)=>{
    
    res.render("signin");
})
app.get('/home',(req,res)=>{
    
    res.render("home");
})


app.get('/signup',(req,res)=>{
    res.render("signup");
})



app.post('/signup',encoding,upload.single('image'),async(req,res)=>{
   try{ 
    const user=await User.findOne({username:req.body.username});
    if(user) return res.send("User already exist");
    
    const data=req.body;
    //console.log(data);
    //create newuser document using mongoose model
    const newUser=new User({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        username:req.body.username,
        password:req.body.password,
        phoneno:req.body.phoneno,
        image:'images/'+req.file.filename,
    })

    //save new person in the database
    const response=await newUser.save();
    //console.log(response);
    //res.json(response);
    const payload={
        id:response.id,
        username:response.username
    }
    const token=await generateToken(payload);
   // console.log("Token is :",token);
    res.cookie("jwt",token,{
        httpOnly:true,
    });
    //res.send(token);
    res.redirect('/signin');
   }
   catch(err){
    console.log("Error:",err);
   }
})

app.post('/signin',encoding,
    passport.authenticate('local',{failureRedirect:'/signup'}),async(req,res)=>{
       
        const {username, password} = req.body;

        // Find the user by username
        const user = await User.findOne({username: username});
      
        
        const payload={
            id:user.id,
            username:user.username
        }
        const token=await generateToken(payload);
       // console.log("Token is :",token);
        res.cookie("jwt",token,{
            httpOnly:true,
           expires: new Date(Date.now() + 3000000),
            
        });
        //console.log(data);
        res.render("home",{name:user.firstname,surname:user.lastname,user:user});
    }

);
app.get('/main',encoding,jwtmiddleware,async(req,res)=>{
       
    const userData=req.user;
    let user=await User.findById({_id:userData.id});
        
        res.render("Mainpage",{name:user.firstname,surname:user.lastname,user:user});
    });
   
    app.get('/logout',(req,res)=>{

        try
        {
           
               req.session.destroy();
                res.clearCookie("jwt");
                console.log("Cookie Deleted");
                res.redirect("/signin");
           
        }
        catch(err){
               console.log(err);
        }
    })

    app.get('*',(req,res)=>{
        res.redirect("/signin");

    });
   
    

app.listen(3000,()=>{
    console.log("Server running at Port 3000")
});