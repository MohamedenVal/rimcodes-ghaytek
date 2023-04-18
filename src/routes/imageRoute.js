const express = require('express')

const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')

const router = express.Router()

const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

/**
 * S3 setup
 */

const s3 = new aws.S3({
accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
region: process.env.BUCKETEER_AWS_REGION,

});

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
}

/**
 * the specific implemenation for the ability to upload images
 * using mutler and mongoose and in an express sever
 * 
 */

const uploadS3 = multer({ 
    storage: multerS3({
        s3: s3,
        bucket: 'samsar',//process.env.BUCKETEER_BUCKET_NAME,
        metadata: function (req, file, cb) {
        cb(null, {fieldName:  file.fieldname});
        },
        key: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extention = FILE_TYPE_MAP[file.mimetype];
        cb(null, `public/samsar/${fileName}-${Date.now()}.${extention}`)
        },
        acl: 'public-read'
    }),
});


router.route('/:id')
    .put(uploadS3.single('image'), authController.updateClientImage)

module.exports = router
