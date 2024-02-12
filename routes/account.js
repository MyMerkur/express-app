const express = require('express');
const routes = express.Router();
const accountController = require('../controllers/accountController');
const locals = require('../middleware/locals');


//Login
routes.get('/login',locals,accountController.getLogin);
routes.post('/login',locals,accountController.postLogin);

//Register
routes.get('/register',locals,accountController.getRegister);
routes.post('/register',locals,accountController.postRegister);

routes.get('/logout',locals,accountController.getLogout);

routes.get('/user',locals,accountController.getUser);

routes.get('/reset-password',locals,accountController.getReset);
routes.post('/reset-password',locals,accountController.postReset);

routes.get('/reset-password/:token',locals,accountController.getNewPassword);
routes.post('/new-password',locals,accountController.postNewPassword);


module.exports = routes;