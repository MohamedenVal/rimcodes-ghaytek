const asyncHandler = require('express-async-handler')

const notificationController = require('../controllers/notificationsController')
const {User} = require('../models/User')
// const {Service} = require('../models/Service')
const {Demand} = require('../models/Demand')

/**
 * @desc Get all Demands
 * @route Get /demands
 * @access Public
 */
 const getAllDemands = asyncHandler(async (req, res) => {
    // get all the demands
    const demands = await Demand.find().populate('user service', '-password').sort([['updatedAt', -1]])
    // Post.find({}).sort([['date', -1]]).exec
    if(!demands?.length) {
        return res.status(400).json({ message: 'No demandss found'})
    }

    // const demandsWithUser = await Promise.all(demands.map(async (demand) => {
    //     const user = await User.findById(demand.user).lean().exec()
    //     return { ...demand, user: user.username}
    // }))

    res.json(demands)
})

/**
 * @desc Get Demand
 * @route Get /demands/:id
 * @access Public
 */
 const getDemand = asyncHandler(async (req, res) => {
    const { id } = req.params
    console.log("clients demands");

    // get all the demands
    const demand = await Demand.findById(id).populate('user service worker', '-password')
    if(!demand) {
        return res.status(400).json({ message: 'No demand found with the given id'})
    }

    res.json(demand)
})

/**
 * @desc Get a user demand
 * @route Get /demands/client/:id
 * @access Private
 */
const getClientDemands = asyncHandler( async (req, res) => {
    const { id } = req.params
    console.log("clients demands");
    const demands = await Demand.find({ user: id}).populate('user service worker', '-password')

    res.json(demands)
})

/**
 * @desc Get a user demand
 * @route Get /demands/worker/:id
 * @access Private
 */
const getWorkerDemands = asyncHandler( async (req, res) => {
    const { id } = req.params
    const demands = await Demand.find({ worker: id}).populate('user service worker', '-password')

    res.json(demands)
})

/**
 * @desc Create a new Demand
 * @route Post /demands
 * @access public
 */
const createDemand = asyncHandler(async (req, res) => {
    const { user, title, details, service, address, date } = req.body
    if ( !title || !service ) {
        return res.status(400).json({
            message: "All fields are required",
            details: `${!user ?? 'user id'} and ${!title ?? 'title'} and ${!details ?? 'details'} and  ${!service || 'service'}`
        })
    }

    const demandUser = await User.findById(user).exec()
    if (!demandUser) {
        return res.status(400).json({ message: 'the user ID does not exists'})
    }
    const demandService = await User.findById(service).exec()
    if (demandService) {
        return res.status(400).json({ message: 'the service ID does not exists'})
    }

    // Create and store demand
    const demandObject = { user, title, details, service, address, date }
    const createdDemand = await Demand.create(demandObject)

    if (createdDemand) {
        res.status(201).json({ message: `New demand ${createdDemand.title} was send`})
    } else {
        res.status(400).json({ message: 'Invalid demand creation '})
    }
})

/**
 * @desc Updating a demand
 * @route PATCH /demands
 * @access Public
 */
const updateDemand = asyncHandler( async (req, res) => {
    const { id, title, details, service, status, worker, user, address } = req.body
    if ( !id || !title || !service ) {
        return res.status(400).json({
            message: "All fields are required",
            details: `${!title ?? 'title'} and ${!details ?? 'details'} and  ${!service || 'service'}`
        })
    }

    // Checkig if the demand with the given id exists
    const demand = await Demand.findById(id).exec()
    if (!demand) {
        return res.status(400).json({ message: 'Demand not found'})
    }

    // const demandUser = await User.findById(user).exec()
    // if (demandUser) {
    //     return res.status(400).json({ message: 'the user ID does not exists'})
    // }
    const demandService = await User.findById(service).exec()
    if (demandService) {
        return res.status(400).json({ message: 'the service ID does not exists'})
    }

    demand.worker = worker
    demand.title = title
    demand.details = details
    demand.address = address
    demand.service = service
    demand.status = status
    demand.user = user

    const updatedDemand = await demand.save()
    res.json({ message: `${updatedDemand.title} was updated`})
})

// implement a function for assigning demand to worker


/**
 * @desc Delete a demand
 * @route Delete /demands
 * @access Private
 */
 const deleteDemand = asyncHandler(async (req, res) => {
    // Delete Demand
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Deamnd ID required' })
    }

    // Confirm demand exists to delete
    const demand = await Demand.findById(id).exec()
    if (!demand) {
        return res.status(400).json({ message: 'Demand not found' })
    }

    const result = await demand.deleteOne()

    const reply = `Demand ${result.title} with ID ${result._id} deleted`
    res.json(reply)
})


module.exports = {
    getAllDemands,
    getDemand,
    getClientDemands,
    getWorkerDemands,
    createDemand,
    updateDemand,
    deleteDemand
}