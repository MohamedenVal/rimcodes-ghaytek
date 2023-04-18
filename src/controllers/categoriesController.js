const asyncHandler = require('express-async-handler')

const {User} = require('../models/User')
const {Service} = require('../models/Service')
const {Category} = require('../models/Category')

/**
 * @desc Get all Categories
 * @route Get /categories
 * @access Private
 */
const getAllCategories = asyncHandler(async (req, res) => {
    // get all the categories
    const categories = await Category.find().populate('user category', '-password')
    if(!categories?.length) {
        return res.status(400).json({ message: 'No Categoriess found'})
    }

    res.json(categories)
})

/**
 * @desc Get single Category
 * @route Get /categories/:id
 * @access Public
 */
const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    const category = await Category.findById(id).populate('user category', '-password')

    if (!category) {
        res.status(400).json({ message: 'No category with the given id!'})
    }

    res.send(category)

})

/**
 * @desc Create a new category
 * @route Post /categories
 * @access Private
 */
const createNewCategory = asyncHandler(async (req, res) => {
    // Create a new Category
    const { user, category, title, details } = req.body

    if (!user || !title || !details  ) {
        return res.status(400).json({ message: 'All fields(user, title, details or category) are required'})
    }
    
    // checking user exists
    const categoryUser = await User.findById(user).exec()
    if (!categoryUser) {
        return res.status(400).json({ message: 'The user is invalid' })
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

    let categoryObject = {}
    // Checking for invalid category if provided
    if (category) {
        const subCategory = await Category.findById(category).exec()
        if (!subCategory) {
            return res.status(400).json({ message: 'The category is invalid'})
        }
        categoryObject = { user, category, title, details, image: imagePath }

    }

    categoryObject = { user, title, details,  image: imagePath }

    // Create and store service
    const createdCategory = await Category.create(categoryObject)

    // createdCategory = await createdCategory.save()

    if (createdCategory) {
        res.status(201).json({ message: `New service ${createdCategory.title} created`})
    } else {
        res.status(400).json({ message: 'Invalid service data recieved' })
    }
})

/**
 * @desc Update a category
 * @route PATCH /categories
 * @access Private
 */
const updateCategory = asyncHandler(async (req, res) => {
    // Update a Category
    const { id, user, category, title, details, active } = req.body

    if ( !id || !user || !title || !details || !active ) {
        return res.status(400).json({ message: 'All fields(user, title, details, active or category) are required'})
    }

    // Confirm service exists to update
    const editedCategory = await Category.findById(id).exec()
    if (!editedCategory) {
        return res.status(400).json({ message: 'Category not found'})
    }

    // Check for service with the same title
    const duplicate = await Category.findOne({ title }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate category title' })
    }

    // checking user exists
    const categoryUser = await User.findById(user).exec()
    if (!categoryUser) {
        return res.status(400).json({ message: 'The user is invalid' })
    }

    const file = req.file;
    let imagePath;

    let basePath = process.env.BASE_PATH;
    if(file) {
        fileName = req.file.key;
        basePath = process.env.BUCKETEER_BUCKET_NAME || ``;
        imagePath = `${basePath}${fileName}`;
        editedCategory.image = imagePath
    }

    // Checking for invalid category if provided
    if (category) {
        const subCategory = await Category.findById(category).exec()
        if (!subCategory) {
            return res.status(400).json({ message: 'The category is invalid'})
        }
        editedCategory.category = category
    }

    editedCategory.user = user
    editedCategory.title = title
    editedCategory.details = details
    editedCategory.active = active

    const updatedCategory = await editedCategory.save()

    res.json({ message: `${updatedCategory.title} updated`})
})

/**
 * @desc Delete a category
 * @route Delete /categories
 * @access Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
    // Delete Category
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Check if category has sub categories or services refrencing it
    const  subCategory = await Category.findOne({ category: id}).lean().exec()
    if(subCategory) {
        return res.status(400).json({ message: 'Category has subcategories assigned to it!'})
    }

    const service = await Service.findOne({ category: id }).lean().exec()
    if(service) {
        return res.status(400).json({ message: 'Category has services assigned to it'})
    }

    // Confirm service exists to delete
    const category = await Category.findById(id).exec()
    if (!category) {
        return res.status(400).json({ message: 'Category not found' })
    }

    const result = await category.deleteOne()

    const reply = `Category ${result.title} with ID ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllCategories,
    getCategory,
    createNewCategory,
    updateCategory,
    deleteCategory
}
