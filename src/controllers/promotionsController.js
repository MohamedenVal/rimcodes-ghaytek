const asyncHandler = require('express-async-handler')

const {Promotion} = require('../models/Promotion')
const { User } = require('../models/User')

/**
 * @desc Get all Promotions
 * @route Get /promotions
 * @access Public
 */
const getAllPromos = asyncHandler(async (req, res) => {
    // get all the promotions
    const promos = await Promotion.find()
    if(!promos?.length) {
        return res.status(400).json({ message: 'No Promotions found'})
    }

    res.json(promos)
})

/**
 * @desc Get all Active Promotions
 * @route Get /promotions/active
 * @access Public
 */
const getActivePromos = asyncHandler(async (req, res) => {
    // get all the promotions
    const promos = await Promotion.find({ active: true })
    if(!promos?.length) {
        return res.status(400).json({ message: 'No Promotions found'})
    }

    res.json(promos)
})

/**
 * @desc Get single Promotion
 * @route Get /promotions/:id
 * @access Public
 */
const getPromotion = asyncHandler(async (req, res) => {
    const { id } = req.params
    const promotion = await Promotion.findById(id)

    if (!promotion) {
        res.status(400).json({ message: 'No promotion with the given id!'})
    }

    res.send(promotion)

})

/**
 * @desc Create a new promotion
 * @route Post /promotion
 * @access Private
 */
const createNewPromotion = asyncHandler(async (req, res) => {
    // Create a new Promotion
    const { title, details } = req.body

    if ( !title  ) {
        return res.status(400).json({ message: 'All fields( title or details ) are required'})
    }

    const file = req.file;
    let imagePath;

    let fileName = 'piblic/images/service.png';
    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = `${basePath}${fileName}`;
    }
    let promotionObject = {}

    promotionObject = { title, details, image: imagePath }

    // Create and store service
    const promotion = await Promotion.create(promotionObject)

    // createdCategory = await createdCategory.save()

    if (promotionCategory) {
        res.status(201).json({ message: `New service ${promotion.title} created`})
    } else {
        res.status(400).json({ message: 'Invalid promotion data recieved' })
    }
})

/**
 * @desc Book a promotion
 * @route POST /promotions/book
 * @access
 */
const bookPromotion = asyncHandler ( async (req, res) => {
    const { user, id } = req.body
    if ( !user || !id  ) {
        return res.status(400).json({ message: 'All fields( id or user ) are required'})
    }

    const client = await User.findById(user)
    const promotion = await Promotion.findById(id)

    if ( !client || !promotion  ) {
        return res.status(400).json({ message: 'user or promotion is invalid!'})
    }

    client.promos.push(id)

    res.status(200).json({ message: 'Promo was booked succesfully!'})

})

/**
 * @desc Update a promotion
 * @route PATCH /promotions
 * @access Private
 */
const updatePromotion = asyncHandler(async (req, res) => {
    // Update a Promotion
    const { id, title, details, active } = req.body

    if ( !id || !title  ) {
        return res.status(400).json({ message: 'All fields( title, details or active) are required'})
    }

    // Confirm promotion exists to update
    const editedPromotion = await Promotion.findById(id).exec()
    if (!editedPromotion) {
        return res.status(400).json({ message: 'Promotion not found'})
    }

    const file = req.file;
    let imagePath;

    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
        editedPromotion.image = imagePath
    }

    editedPromotion.title = title
    editedPromotion.details = details
    editedPromotion.active = active

    const updatedPromotion = await editedPromotion.save()

    res.json({ message: `${updatedPromotion.title} updated`})
})

/**
 * @desc Delete a promotion
 * @route Delete /promotions
 * @access Private
 */
const deletePromotion = asyncHandler(async (req, res) => {
    // Delete Promotion
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Promotion ID is required' })
    }

    // Confirm service exists to delete
    const promo = await Promotion.findById(id).exec()
    if (!promo) {
        return res.status(400).json({ message: 'Promotion not found' })
    }

    const result = await promo.deleteOne()

    const reply = `Category ${result.title} with ID ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllPromos,
    getActivePromos,
    getPromotion,
    createNewPromotion,
    bookPromotion,
    updatePromotion,
    deletePromotion
}