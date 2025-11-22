import axios from 'axios';
import User from '../users.model.js';
import { calculateDistance } from '../utils/distanceCalculator.js';

// Check if user's current location is eligible for schemes
export const checkLocationEligibility = async (req, res) => {
    try {
        console.log('=== CHECK LOCATION ELIGIBILITY ===');
        console.log('Request body:', req.body);

        const { name, password, latitude, longitude, address } = req.body;

        // Validate required fields
        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: 'name and password are required',
            });
        }

        // User must provide either coordinates OR address for current location
        if (!address && (!latitude || !longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Either address OR both latitude and longitude are required for location check',
            });
        }

        // Find user by name and password (In production: use JWT auth instead!)
        const user = await User.findOne({ name, password });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid name or password',
            });
        }

        console.log('User found:', user.name);
        console.log('Registered location:', user.location.coordinates);
        console.log('Registered address:', user.address);

        let currentLat, currentLng;

        // Get current location coordinates
        if (latitude !== undefined && longitude !== undefined) {
            // User provided coordinates (React Native)
            currentLat = parseFloat(latitude);
            currentLng = parseFloat(longitude);

            if (isNaN(currentLat) || isNaN(currentLng)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude or longitude format',
                });
            }

            console.log('Using provided coordinates:', { currentLat, currentLng });
        } else if (address) {
            // User provided address - need to geocode (Web)
            const apiKey = process.env.OPENCAGE_API_KEY;

            if (!apiKey) {
                return res.status(500).json({
                    success: false,
                    message: 'Geocoding service not configured',
                });
            }

            console.log('Geocoding current address:', address);

            const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                address
            )}&key=${apiKey}`;

            const geoRes = await axios.get(geocodeUrl);

            if (!geoRes.data.results || geoRes.data.results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Unable to geocode the provided address',
                });
            }

            currentLat = geoRes.data.results[0].geometry.lat;
            currentLng = geoRes.data.results[0].geometry.lng;

            console.log('Geocoded current coordinates:', { currentLat, currentLng });
        }

        // Get user's registered coordinates from database
        const [registeredLng, registeredLat] = user.location.coordinates;

        // Calculate distance between registered location and current location
        const distance = calculateDistance(
            registeredLat,
            registeredLng,
            currentLat,
            currentLng
        );

        console.log('Distance from registered location:', distance.toFixed(2), 'km');

        // Define eligibility radius (in kilometers)
        // You can change this value: 5, 10, 20, 50, 100, etc.
        const ELIGIBILITY_RADIUS_KM = 10;

        const isEligible = distance <= ELIGIBILITY_RADIUS_KM;

        console.log('Eligibility radius:', ELIGIBILITY_RADIUS_KM, 'km');
        console.log('Eligibility check:', isEligible ? 'ELIGIBLE ✅' : 'NOT ELIGIBLE ❌');

        return res.status(200).json({
            success: true,
            message: isEligible
                ? 'You are eligible to avail the scheme!'
                : `You are outside the eligible area. You must be within ${ELIGIBILITY_RADIUS_KM} km of your registered location.`,
            data: {
                isEligible,
                distance: parseFloat(distance.toFixed(2)), // in km
                eligibilityRadius: ELIGIBILITY_RADIUS_KM,
                registeredLocation: {
                    latitude: registeredLat,
                    longitude: registeredLng,
                    address: user.address,
                },
                currentLocation: {
                    latitude: currentLat,
                    longitude: currentLng,
                },
                user: {
                    id: user._id,
                    name: user.name,
                },
                scheme: isEligible ? {
                    name: 'Government Welfare Scheme 2024',
                    benefits: 'Access to subsidized healthcare and education services',
                    validUntil: '2024-12-31',
                    category: 'Social Welfare'
                } : null
            },
        });

    } catch (err) {
        console.error('=== ERROR IN LOCATION ELIGIBILITY CHECK ===');
        console.error('Error message:', err.message);

        if (err.response) {
            console.error('API Error Response:', err.response.data);
        }

        console.error('==========================================');

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};