const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
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

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});


categorySchema.set('toJSON', {
    virtuals: true
});

exports.Category = mongoose.model('Category', categorySchema)
exports.categorySchema = categorySchema;
