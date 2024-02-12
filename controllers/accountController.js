const User = require('../models/account');
const bcrypt = require('bcrypt');
const Reservation = require('../models/reservation');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
sgMail.setApiKey('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');

//Login
exports.getLogin = (req,res,next)=>{
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    console.log('isAuthenticated:', req.session.isAuthenticated);
    res.render('account/login',{
        title:'Login',
        path:'/login',
        errorMessage: errorMessage
    })
}


exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email:email})
        .then(user=>{
            if(!user){
                req.session.errorMessage='Kullanıcı Bulunamadı';
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/login')
                })
            }

            bcrypt.compare(password,user.password)
                .then(isSucces=>{
                    if(isSucces){
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        console.log(`Hoşgeldiniz ${req.session.user.name}`);
                        return req.session.save(function (err) {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    res.redirect('/login');
                })
                .catch(err=>{console.log(err)});
        })
        .catch(err=>{console.log(err)});
}




//Register
exports.getRegister = (req,res,next)=>{
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('account/register',{
        title:'register',
        path:'/register',
        errorMessage:errorMessage
    })
}

exports.postRegister = (req,res,next)=>{

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email:email})
        .then(user=>{
            if(user){
                req.session.errorMessage = 'Bu mail adresi ile daha önce kayıt oluşturulmuş';
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/register');
                })
            }
            return bcrypt.hash(password,10);
        })
        .then(hasedPassword=>{
            const newUser = new User({
                name:name,
                email:email,
                password:hasedPassword
            });
            return newUser.save()
        })
        .then(()=>{
            res.redirect('/login');
            const msg = {
                to: email, 
                from: 'dogukan755@icloud.com', 
                templateId: 'd-a0f271d0b8ff4a61b969e75e2c9b0ed6',
                dynamicTemplateData: {
                    name: name
                  }
                };
              sgMail
                .send(msg)
                .then(() => {
                  console.log('Email sent')
                })
                .catch((error) => {
                  console.error(error)
                })
        })
        .catch(err=>{console.log(err)}); 
}



//User

exports.getUser = async(req,res,next)=>{

    try{
        const userId = req.session.user._id;
        console.log(userId)
        const allReservations = await Reservation.find({userId:userId});
        console.log(allReservations)
        const confirmedReservations = allReservations.filter(reservation=>reservation.isSubmit);
        res.render('account/user', {
            title: 'User',
            path: '/user',
            user: req.session.user,
            confirmedReservations: confirmedReservations
        });
    }
    catch(err){
        console.log(err)
    }
}


//Reset Password
exports.getReset = (req,res,next)=>{
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage

    res.render('account/reset',{
        title:'Reset Password',
        path:'/reset-password',
        errorMessage:errorMessage
    })
}

exports.postReset = (req,res,next)=>{

    const email = req.body.email;

    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({email:email})
        .then(user=>{
            if(!user){
                req.session.errorMessage = 'Mail Adresi Bulunamadı';
                req.session.save(function(err){
                    console.log(err);
                    return res.redirect('/reset-password');
                })
            } else {
                user.resetToken = token;
                user.resetTokenExpiration = Date.now()+3600000;
                return user.save();
            }
        }).then(result=>{
                    res.redirect('/');

                const msg = {
                    to:email,
                    from:'dogukan755@icloud.com',
                    subject:"Parolanızı Sıfırlayın",
                    templateId: 'd-3ddb409e1cc94ffc936768fceeaae3de',
                    dynamicTemplateData: {
                        resetLink: 'http://localhost:3000/reset-password/' + token
                    }
                }
                sgMail
                    .send(msg)
                    .then(()=>{
                        console.log('Email Send')
                    })
                    .catch(err=>{console.log(err)})
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    const token = req.params.token;

    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        }
    }).then(user => {
        res.render('account/new-password',{
            path:'/new-password',
            title:'New Password',
            errorMessage:errorMessage,
            userId:user._id.toString(),
            passwordToken:token
        });
    }).catch(err => {
        console.log(err);
    });
}


exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;

    let _user;

    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        },
        _id: userId
    }).then(user => {
        _user = user;
        return bcrypt.hash(newPassword, 10);
    }).then(hashedPassword => {
        _user.password = hashedPassword;
        _user.resetToken = undefined;
        _user.resetTokenExpiration = undefined;
        return _user.save();
    }).then(() => {
        res.redirect('/login');
    }).catch(err => {
        console.log(err);
    });
}


//Logout

exports.getLogout = (req,res,next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    })
}