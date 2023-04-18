const mongoose = require("mongoose");

const promotionSchema = mongoose.Schema(
    {
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

promotionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});


promotionSchema.set('toJSON', {
    virtuals: true
});

exports.Promotion = mongoose.model('Promotion', promotionSchema)
exports.promotionSchema = promotionSchema;
