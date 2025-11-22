import axios from 'axios';
import User from '../users.model.js';

export const createUser = async (req, res) => {
    try {
        console.log('=== CREATE USER REQUEST ===');
        console.log('Request body:', req.body);

        const { name, password, address } = req.body;

        if (!name || !password || !address) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({
                success: false,
                message: 'name, password and address are required',
            });
        }

        // Check if API key exists
        const apiKey = process.env.OPENCAGE_API_KEY;
        console.log('API Key check:', apiKey ? 'EXISTS' : 'MISSING');

        if (!apiKey) {
            console.error('OPENCAGE_API_KEY is not set in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Geocoding service not configured',
            });
        }

        console.log('Attempting to geocode address:', address);

        // 1. Geocode the address
        const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            address
        )}&key=${apiKey}`;

        console.log('Geocode URL:', geocodeUrl.replace(apiKey, 'HIDDEN'));

        const geoRes = await axios.get(geocodeUrl);

        console.log('Geocode response status:', geoRes.status);
        console.log('Geocode results count:', geoRes.data.results?.length || 0);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            console.log('No geocode results found');
            return res.status(400).json({
                success: false,
                message: 'Unable to geocode this address',
            });
        }

        const { lat, lng } = geoRes.data.results[0].geometry;
        console.log('Geocoded coordinates:', { lat, lng });

        // 2. Create user with location
        console.log('Attempting to create user in database...');

        const user = await User.create({
            name,
            password,
            address,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
            },
        });

        console.log('User created successfully:', user._id);

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
        console.error('=== ERROR IN CREATE USER ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);

        if (err.response) {
            console.error('API Error Response:', err.response.data);
            console.error('API Error Status:', err.response.status);
        }

        if (err.stack) {
            console.error('Stack trace:', err.stack);
        }

        console.error('===========================');

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};