const mongoose = require("mongoose")

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        subscription: {
            endpoint: {
                type: String
            },
            expirationTime: {
                type: String
            },
            keys: {
                p256dh: {
                    type: String
                },
                auth: {
                    type: String
                }
            },
        }
    }
)

notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});


notificationSchema.set('toJSON', {
    virtuals: true
});

exports.Notification = mongoose.model('Notification', notificationSchema)
exports.notificationSchema = notificationSchema;