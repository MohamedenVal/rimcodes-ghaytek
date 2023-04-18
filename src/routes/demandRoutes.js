const express = require('express')
const demandsController = require('../controllers/demandsController')
// const notificationController = require('../controllers/notificationsController')

const router = express.Router()

// Parsing multi-part formdata
var multer = require('multer');
var upload = multer();
// for parsing multipart/form-data
router.use(upload.array()); 
// app.use(express.static('public'))
router.route('')
    .get(demandsController.getAllDemands)
    .post(demandsController.createDemand)
    .patch(demandsController.updateDemand)
    .delete(demandsController.deleteDemand)

router.route('/client/:id')
    .get(demandsController.getClientDemands)

router.route('/worker/:id')
    .get(demandsController.getWorkerDemands)

router.route('/:id')
    .get(demandsController.getDemand)

module.exports = router
