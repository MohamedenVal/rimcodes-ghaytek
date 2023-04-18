const mongoose = require("mongoose");

const demandSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: 'User'
        },
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Service'
        },
        title: {
            type: String,
            required: true
        },
        details: {
            type: String
        },
        read: {
            type: Boolean,
            default: false
        },
        date: {
            type: String
        },
        address: {
            type: String
        },
        status: {
            type: String,
            default: "جاري"
        }
    },
    {
        timestamps: true
    }
)

demandSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

demandSchema.set('toJSON', {
    virtuals: true
});

exports.Demand = mongoose.model('Demand', demandSchema)
exports.demandSchema = demandSchema
