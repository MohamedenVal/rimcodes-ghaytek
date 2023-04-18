const { Notification } = require('../models/Notification')
const { User } = require('../models/User')
const { Demand } = require('../models/Demand')

const asyncHandler = require('express-async-handler')
// const mongoose = require('mongoose')
const webpush = require('web-push')

/**
 * @desc Get all notifications
 * @route Get /notifs
 * @access Private
 */
const getAllNotifs = asyncHandler(async (req, res) => {
    const notifs = await Notification.find().select('-password')
    if(!notifs?.length ) {
        return res.status(400).json({ message: 'No notifications found'})
    }
    res.json(notifs)
})

/**
 * @desc Get user
 * @route Get /notifs/:id
 * @access Private
 */
const getNotif = asyncHandler(async (req, res) => {

    const { id } = req.params

    const notif = await Notification.findById(id).populate('user', '-password')
    if(!notif ) {
        return res.status(400).json({ message: 'No notification found'})
    }
    res.json(notif)
})



/**
 * @desc Create new notification
 * @route Post /subscribe/:id
 * @access Public
 */
const subscribe = asyncHandler ( async (req, res) => {
    // params
    const { id } = req.params

    // get data
    const subscription = req.body

    // Check if user already had a subscription
    let duplicate = await Notification.findOne({ user: id })
    const notifObj = { user: id, subscription }

    if (duplicate) {
        // Update subscription
        duplicate.subscription = subscription
        duplicate = await duplicate.save()
    } else {
        // Create and store notification
        // continue implentation  ...
        duplicate = await Notification.create(notifObj)
    }

    if (req.body.endpoint && duplicate) {    
        res.status(200).send({ message: "Subscribed successfully" })
    } else {
        res.status(500).send({ message: "The subscription must contain an endpoint" });
    }

})

/**
 * Push to admins
 *  POST /push/admins
 */
const pushToAdmins = asyncHandler ( async (req, res) => {
    const { user, title, details, service, payload } = req.body
    if (!user || !title || !service ) {
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
    const demandObject = { user, title, details, service }
    const createdDemand = await Demand.create(demandObject)

    
    // Helper function for trigggering push messages
    function triggerNotification(subscription, data) {
        return webpush.sendNotification(subscription, JSON.stringify(data))
        .catch(err => {
            console.error("Error sending notification, reason: ", err);
            // res.send({ message: 'Error sending notification' });
        });
    }
    
    console.log("push to admins");
    const admins = await User.find({ role: 'Admin'})
    console.log(admins);
    
    webpush.setVapidDetails(
        'mailto:rimmart.com@gmail.com',
        process.env.PUBLIC_KEY,
        process.env.PRIVATE_KEY
        )
        
        if(admins) {
            let promiseChain = Promise.resolve();
            let iterable = [];
            admins.forEach( async (user) => {
                console.log("Creating notifs ....");
                const userNotif = await Notification.findOne({ user: user.id})
                if (userNotif) {
                    console.log(userNotif);
                    promiseChain = promiseChain.then( () => {
                        console.log("Resolving the promise ...");
                        return triggerNotification(userNotif.subscription, payload)
                    })
                    iterable.push(promiseChain);
                }
                
            })
            
            Promise.all(iterable).then(() => {
                res.send({ message: 'Notification sent successfully to all admins subscribers.' })
            })
            .catch(function (err) {
                res.status(500).send({ message: 'We were unable to send messages to all admins subscriptions' })
            });
        }
        
    })
    
    
    /**
 * Push to specific user 
 *  POST /notifs/:id
    */

const pushMsg = asyncHandler ( async (req, res) => {
    const { payload } = req.body
    const { id } = req.params

    // Helper function for trigggering push messages
    function triggerNotification(subscription, data) {
        return webpush.sendNotification(subscription, JSON.stringify(data))
        .catch(err => {
            console.error("Error sending notification, reason: ", err);
            // res.send({ message: 'Error sending notification' });
        });
    }

    const employees = await User.find({ role: 'Employee'})
    // console.log(admins);
    
    webpush.setVapidDetails(
        'mailto:rimmart.com@gmail.com',
        process.env.PUBLIC_KEY,
        process.env.PRIVATE_KEY
        )
        
        if(employees) {
            let promiseChain = Promise.resolve();
            let iterable = [];
            employees.forEach( async (user) => {
                console.log("Creating notifs ....");
                const userNotif = await Notification.findOne({ user: user.id})
                if (userNotif && user.id === id ) {
                    console.log(userNotif);
                    promiseChain = promiseChain.then( () => {
                        console.log("Resolving the promise ...");
                        return triggerNotification(userNotif.subscription, payload)
                    })
                    iterable.push(promiseChain);
                }
                
            })
            
            Promise.all(iterable).then(() => {
                res.send({ message: 'Notification sent successfully to all employees subscribers.' })
            })
            .catch(function (err) {
                res.status(500).send({ message: 'We were unable to send messages to all employees subscriptions' })
            });
        }
        
})


/**
 * Push to all
 *  POST /notifs
 */
const pushToAll = asyncHandler ( async (req, res) => {
    const { payload } = req.body
    const notifications = await User.find().lean().exec()


    webpush.setVapidDetails(
        'mailto:rimmart.com@gmail.com',
        process.env.PUBLIC_KEY,
        process.env.PRIVATE_KEY
    )
    
    if(notifications) {
        let promiseChain = Promise.resolve();
        let iterable = [];
        notifications.forEach((notif) => {
            
            promiseChain = promiseChain.then( () => {
                return triggerNotification(notif.subscription, payload)
            })
            iterable.push(promiseChain);
        })
        Promise.all(iterable).then(() => res.send({ message: 'Notification sent successfully to all subscribers.' }))
        .catch(function (err) {
          res.status(500).send({ message: 'We were unable to send messages to all subscriptions' })
        });
    }
})

module.exports = {
    getAllNotifs,
    getNotif,
    subscribe,
    pushToAdmins,
    pushMsg,
    pushToAll
}

