const express = require('express')
const notificationController = require('../controllers/notificationsController')

const router = express.Router()

// Parsing multi-part formdata
var multer = require('multer');
var upload = multer();
// for parsing multipart/form-data
router.use(upload.array()); 
// app.use(express.static('public'))
router.route('')
    .get(notificationController.getAllNotifs)
    .post(notificationController.pushToAdmins)

router.route('/push/admins')
    .post(notificationController.pushToAdmins)

router.route('/subscribe/:id')
    .post(notificationController.subscribe)

router.route('/:id')
    .get(notificationController.getNotif)
    .post(notificationController.pushMsg)

module.exports = router
// ssh-add ~/.ssh/rimcodes
// ssh-agent bash