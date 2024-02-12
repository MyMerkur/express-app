const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');
const locals = require('../middleware/locals');

router.get('/admin-reservation',locals,isAdmin,adminController.getAdminReservation);
router.post('/admin-reservation/submit-reservation',locals,isAdmin,adminController.postSubmit);
router.post('/admin-reservation/delete-reservation',locals,isAdmin,adminController.postDelete);

//Admin product
router.get('/products',locals,isAdmin,adminController.getProducts);
router.get('/add-product',locals,isAdmin,adminController.getAddProduct);
router.post('/add-product',locals,isAdmin,adminController.postAddProduct);
router.get('/edit-product/:productid',locals,isAdmin,adminController.getEditProduct);
router.post('/edit-product',locals,isAdmin,adminController.postEditProduct);
router.post('/delete-product',locals,isAdmin,adminController.postDeleteProduct);
//Category
router.get('/categories',locals,isAdmin,adminController.getCategories);
//Add Category
router.get('/add-category',locals,isAdmin,adminController.getAddCategory);
router.post('/add-category',locals,isAdmin,adminController.postAddCategory);
router.get('/edit-category/:categoryid',locals,isAdmin,adminController.getEditCategory);
router.post('/edit-category',locals,isAdmin,adminController.postEditCategory);
router.post('/delete-category',locals,isAdmin,adminController.postDeleteCategory);
//Delete Category




module.exports = router;