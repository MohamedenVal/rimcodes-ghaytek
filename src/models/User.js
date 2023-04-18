const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: "Client"
        },
        active: {
            type: Boolean,
            default: true
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        profile: {
            type: String
        },
        images: {
            type: [String]
        },
        promos: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Promotion'
        }
    },
    {
        timestamps: true
    }
)

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

userSchema.set('toJSON', {
    virtuals: true
});

exports.User = mongoose.model('User', userSchema)
exports.userSchema = userSchema
