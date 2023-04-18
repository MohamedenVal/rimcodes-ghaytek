const {User} = require('../models/User')
const {Service} = require('../models/Service')
const {Category} = require('../models/Category')
const {Promotion} = require('../models/Promotion')

const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

/**
 * @desc Get all users
 * @route Get /users
 * @access Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').populate('promos')
    if(!users?.length ) {
        return res.status(400).json({ message: 'No users found'})
    }
    res.json(users)
})

/**
 * @desc Get all workers
 * @route Get /users/workers
 * @access Private
 */
const getWorkers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'Employee'}).select('-password').populate('promos')
    if(!users?.length ) {
        return res.status(400).json({ message: 'No users found'})
    }
    res.json(users)
})


/**
 * @desc Get user
 * @route Get /users/:id
 * @access Private
 */
const getUser = asyncHandler( async (req, res) => {

    const { id } = req.params

    const user = await User.findById(id).select('-password').populate('promos')
    if(!user ) {
        return res.status(400).json({ message: 'No user found'})
    }
    res.json(user)
})

/**
 * @desc Create a new user
 * @route Post /users
 * @access Private
 */
const createNewUser = asyncHandler( async (req, res) => {
    const { username, password, role, phone, address} = req.body
    // console.log(username, password, role);

    // confirm data
    if (!username || !password ) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    // check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username, username taken'})
    }

    const file = req.file;
    let imagePath;

    let fileName = 'user.png';
    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = `${basePath}${fileName}`;
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashPassword, role, profile: imagePath, phone, address }

    // Create and store user
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ message: `New user ${user.username} created`})
    } else {
        res.status(400).json({ message: 'Invalid user data received'})
    }
})

/**
 * @desc Update a user
 * @route PATCH /users
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, role, active, password, promotion, phone } = req.body

    // confirm data
    if ( !id || !username ) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // checking promo exists
    const promo = await Promotion.findById(promotion).exec()
    if (promotion && !promo) {
        return res.status(400).json({ message: 'The promotion is invalid' })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    // Allow update to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({ message: 'Duplicate username'})
    }

    const file = req.file;
    let imagePath;

    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
        user.profile = imagePath
    }

    user.username = username
    user.role = role
    user.phone = phone
    user.active = active
    user.promos.push(promotion)
    if(password) {
        const hashPassword = await bcrypt.hash(password, 10)
        user.password = hashPassword
    }

    const updateUser = await user.save()

    res.json({ message: `${updateUser.username} updated`})
})

/**
 * @desc Delete a new user
 * @route Delete /users
 * @access Private
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    // avoid searching using invalid id (Cast error)
    if(!mongoose.isValidObjectId(id)){
        return res.status(400).json({ message: 'Invalid user id'});
    }

    if (!id) {
        return res.status(400).json({ message: 'User ID required '})
    }

    // Checking for assigned category or service
    const  service = await Service.findOne({ user: id}).lean().exec()
    if(service) {
        return res.status(400).json({ message: 'User has assigned services'})
    }
    const  category = await Category.findOne({ user: id}).lean().exec()
    if(category) {
        return res.status(400).json({ message: 'User has assigned categories'})
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found '})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)

})

module.exports = {
    getAllUsers,
    getUser,
    createNewUser,
    updateUser,
    deleteUser,
    getWorkers
}
