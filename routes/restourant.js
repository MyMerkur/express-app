const express = require('express');
const router = express.Router();
const restourantController = require('../controllers/restourantController');
const isAuthenticated = require('../middleware/authentication');
const locals = require('../middleware/locals');



router.get('/',locals,restourantController.getIndex);
//products
router.get("/products",locals,isAuthenticated ,restourantController.getProducts);
//selected product
router.get("/products/:productid",locals,isAuthenticated ,restourantController.getProduct);



router.get('/about',locals,isAuthenticated,restourantController.getAbout);
router.get('/galery',locals,isAuthenticated,restourantController.getGalery);

//menu 
router.get('/menu',locals,isAuthenticated,restourantController.getMenu);
router.post('/menu',locals,isAuthenticated,restourantController.postMenu);


module.exports = router;