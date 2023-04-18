const mongoose = require("mongoose");

const serviceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Category'
        },
        title: {
            type: String,
            required: true
        },
        details: {
            type: String
        },
        active: {
            type: Boolean,
            default: true
        },
        image: {
            type: String
        },
        images: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
)

serviceSchema.virtual('id').get(function () {
    return this._id.toHexString();
});


serviceSchema.set('toJSON', {
    virtuals: true
});

exports.Service = mongoose.model('Service', serviceSchema)
exports.serviceSchema = serviceSchema