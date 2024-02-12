const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const port = 3000;
const User = require('./models/account');
const errorController = require('./controllers/error'); 
const restourantRoutes = require('./routes/restourant');
const reservationRoutes = require('./routes/reservation');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongodbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer')



var store = new mongodbStore({
    uri:process.env.MONGODB_URI,
    collection:'mySession'
});

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/img/');
    },
    filename: function (req, file, cb) {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

app.set('view engine','pug');
app.set('views','./views');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use(multer({storage:storage}).single('image'));
app.use(cookieParser());
//app.use(errorController.get404Page);

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge:3600000
    },
    store:store
}))

app.use(csurf());
app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }

    User.findById(req.session.user._id)
        .then(user=>{
            req.user = user;
            next();
        })
        .catch(err=>{console.log(err)})
})

//Route
app.use('/',restourantRoutes);
app.use('/',reservationRoutes);
app.use('/',accountRoutes);
app.use('/admin',adminRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port);
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

