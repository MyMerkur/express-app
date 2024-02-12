const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const isAuthenticated = require('../middleware/authentication');
const locals = require('../middleware/locals')


router.get('/reservation',locals,isAuthenticated,reservationController.getReservation);
router.post('/reservation',locals,isAuthenticated,reservationController.postReservation);

module.exports = router;