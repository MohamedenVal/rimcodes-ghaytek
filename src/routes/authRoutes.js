const express = require('express')

const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

const router = express.Router()

// Parsing multi-part formdata
var multer = require('multer');
var upload = multer();
// for parsing multipart/form-data
router.use(upload.array()); 
// app.use(express.static('public'))

router.route('/')
    .post(loginLimiter, authController.login)

router.route('/register')
    .post(authController.register)

router.route('/update')
    .put(authController.updateProfile)

// router.route('update-image/:id')
//     .post(uploadS3.single('image'), authController.updateClientImage)

router.route('/delete')
    .post(authController.deleteAccountInit)

router.route('/refresh', authController.refresh)
    .get()

router.route('/logout', authController.logout)
    .post()

module.exports = router
