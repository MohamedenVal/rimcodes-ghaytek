const {User} = require('../models/User')
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

/**
 * @desc login 
 * @route POST /auth
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
    // do stuf 
    let { username, password } = req.body
    username = username.trim()
    password = password.trim()
    
    if(!username || !password) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const foundUser = await User.findOne({ username })

    if(!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized, user not found or not aactive'})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Unauthorized, wrong password'})

    const accessToken = jwt.sign(
        {
            "userId": foundUser.id,
            "username": foundUser.username,
            "role": foundUser.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d'}
    )

    res.json({ token: accessToken, id: foundUser.id})
})

/**
 *  @desc username-available
 *  @route POST /available
 *  @access Public
 */
const chechAvailable = asyncHandler( async (req, res) => {
    const { username } = req.body
    User.findOne({ username })
})

/**
 * @desc Refresh 
 * @route GET /auth/refresh
 * @access Public - because acces token has expired
 */
const refresh = (req, res) => {
    // do stuf
}

/**
 * @desc Logout 
 * @route POST /auth/logout
 * @access Public - just to clear cookie if exists
 */
const logout = (req, res) => {
    // do stuf
}

/**
 * @desc Register 
 * @route POST /auth/register
 * @access Public 
 */
const register = asyncHandler(async (req, res) => {
    // do stuf
    const { username, password, phone, address } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    // check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username, username taken'})
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashPassword, phone, address }

    // Create and store user
    const user = await User.create(userObject)
    
    const accessToken = jwt.sign(
        {
            "userId": user.id,
            "username": user.username,
            "role": user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d'}
    )
    
    if (user) {
        res.status(201).json({ user: user, token: accessToken })
    } else {
        res.status(400).json({ message: 'Invalid user data received'})
    }

})

const updateProfile = asyncHandler(async (req, res) => {
    const { id, username, role, active, password } = req.body

    // confirm data
    if ( !id || !username ) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).select('-password')

    if(!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()
    // Allow update to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(400).json({ message: 'Duplicate username'})
    }

    user.username = username
    user.role = role
    user.active = active
    if(password) {
        const hashPassword = await bcrypt.hash(password, 10)
        user.password = hashPassword
    }

    const updateUser = await user.save()

    res.json(updateUser)
})

const updateClientImage = asyncHandler(async (req, res) => {
    const { id } = req.params

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const file = req.file;
    let imagePath;

    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
        user.images.push(user.profile)
        user.profile = imagePath
    }

    
    const updateUser = await user.save()

    res.json(updateUser)

})

const deleteAccountInit = asyncHandler(async (req, res) => {
    const { message, id } = req.body
    // avoid searching using invalid id (Cast error)
    if(id && !mongoose.isValidObjectId(id)){
        return res.status(400).json({ message: 'Invalid user id'});
    } 

    let user = await User.findById(id)
    if (!user) {
        return res.status(400).json({ message: 'User not found '})
    } 

    user.active = false
    const result = await user.save()
    res.json(`Username ${result.username} with ID ${result.id} deleted`)

})

module.exports = {
    login,
    chechAvailable,
    logout,
    refresh,
    register,
    updateProfile,
    updateClientImage,
    deleteAccountInit
}