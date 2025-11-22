// controllers/userController.js
import axios from 'axios';
import User from '../users.model.js';

export const createUser = async (req, res) => {
    try {
        const { name, password, address } = req.body;

        if (!name || !password || !address) {
            return res.status(400).json({
                success: false,
                message: 'name, password and address are required',
            });
        }

        // 1. Geocode the address
        const apiKey = process.env.OPENCAGE_API_KEY; // set this in .env
        const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            address
        )}&key=${apiKey}`;

        const geoRes = await axios.get(geocodeUrl);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Unable to geocode this address',
            });
        }

        const { lat, lng } = geoRes.data.results[0].geometry;

        // 2. Create user with location
        const user = await User.create({
            name,
            password, // in a real app: hash it with bcrypt
            address,
            location: {
                type: 'Point',
                coordinates: [lng, lat], // GeoJSON: [lng, lat]
            },
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                address: user.address,
                location: user.location,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};
