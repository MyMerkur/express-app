const Reservation = require('../models/reservation');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

exports.getReservation = (req,res,next)=>{
    res.render('reservation/reservation',{
        title:'Reservation',
        path:'/reservation',
        user:req.session.user
    })
}

exports.postReservation = (req,res,next)=>{

    const name= req.body.name;
    const email= req.body.email;
    const date = req.body.date;
    const person = req.body.person;
    const time = req.body.time;
    const userId = req.session.user._id

    const newReservation = new Reservation({
        name:name,
        email:email,
        date:date,
        person:person,
        time:time,
        userId:userId
    });
    return newReservation.save()
    .then(() => {
        res.redirect('/')
        const msg = {
            to: email, 
            from: 'dogukan755@icloud.com', 
            subject: `Merhaba ${name}. Rezervasyon başarılı bir şekilde oluşturuldu.`,
            templateId: 'd-beeb3157df204d6eb964208f2ee3277c',
            dynamicTemplateData: {
              name:name,
              date:date,
              time:time,
              person:person
          }
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
            })
            .catch((error) => {
              console.error(error)
            })
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });

   
}