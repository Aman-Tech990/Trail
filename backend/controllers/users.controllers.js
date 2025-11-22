import axios from 'axios';
import User from '../users.model.js';

export const createUser = async (req, res) => {
    try {
        console.log('=== CREATE USER REQUEST ===');
        console.log('Request body:', req.body);

        const { name, password, address, latitude, longitude } = req.body;

        // Validate required fields
        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: 'name and password are required',
            });
        }

        // Check if user provided coordinates directly OR address
        if (!address && (!latitude || !longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Either address OR both latitude and longitude are required',
            });
        }

        let lat, lng, finalAddress;

        // CASE 1: User provided latitude and longitude (from React Native app)
        if (latitude !== undefined && longitude !== undefined) {
            console.log('Using provided coordinates:', { latitude, longitude });

            // Validate and convert coordinates
            const numLat = parseFloat(latitude);
            const numLng = parseFloat(longitude);

            if (isNaN(numLat) || isNaN(numLng)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude or longitude format',
                });
            }

            if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
                });
            }

            lat = numLat;
            lng = numLng;

            // If address is provided, use it; otherwise reverse geocode
            if (address) {
                finalAddress = address;
                console.log('Using provided address:', address);
            } else {
                // Reverse geocode to get address from coordinates
                const apiKey = process.env.OPENCAGE_API_KEY;

                if (apiKey) {
                    try {
                        console.log('Reverse geocoding coordinates...');
                        const reverseUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
                        const reverseRes = await axios.get(reverseUrl);

                        if (reverseRes.data.results && reverseRes.data.results.length > 0) {
                            finalAddress = reverseRes.data.results[0].formatted;
                            console.log('Reverse geocoded address:', finalAddress);
                        } else {
                            finalAddress = `${lat}, ${lng}`;
                        }
                    } catch (err) {
                        console.log('Reverse geocoding failed, using coordinates as address');
                        finalAddress = `${lat}, ${lng}`;
                    }
                } else {
                    finalAddress = `${lat}, ${lng}`;
                }
            }
        }
        // CASE 2: User provided address (needs forward geocoding)
        else if (address) {
            console.log('Geocoding address:', address);

            const apiKey = process.env.OPENCAGE_API_KEY;

            if (!apiKey) {
                console.error('OPENCAGE_API_KEY is not set in environment variables');
                return res.status(500).json({
                    success: false,
                    message: 'Geocoding service not configured',
                });
            }

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

            lat = geoRes.data.results[0].geometry.lat;
            lng = geoRes.data.results[0].geometry.lng;
            finalAddress = address;

            console.log('Geocoded coordinates:', { lat, lng });
        }

        // Create user with location
        console.log('Creating user in database...');
        console.log('Final data:', { name, address: finalAddress, coordinates: [lng, lat] });

        const user = await User.create({
            name,
            password, // In production: hash with bcrypt!
            address: finalAddress,
            location: {
                type: 'Point',
                coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
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