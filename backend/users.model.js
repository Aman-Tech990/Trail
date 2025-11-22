// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true, // for demo – in real apps hash it!
        },
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                // [longitude, latitude]
                type: [Number],
                required: true,
            },
        },
    },
    { timestamps: true }
);

// For geospatial queries
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;
