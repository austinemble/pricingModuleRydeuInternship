const axios = require("axios");
const pricingData = require("../model/pricingModel");
const dotenv = require("dotenv");
dotenv.config();
// Cities where email is not required
const NO_EMAIL_NEEDED_CITIES = ["london", "paris"];

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Function to calculate distance using Google Geocoding API
async function calculateDistance(origin, destination) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_API_KEY}`;
    console.log(url);

    try {
        const response = await axios.get(url);
        const data = response.data;
        console.log(data)

        if (data.status !== "OK") throw new Error("Invalid Google API Response");
        if (data.rows[0].elements[0].status !== "OK") throw new Error("Invalid Google API Response");

        const distanceInMts = parseInt(data.rows[0].elements[0].distance.value);
        const distance = parseInt(distanceInMts / 1000);
        console.log(distance);
        return distance; // Return numeric distance
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch distance");
    }
}

// Determine if email is required
exports.checkEmail = async (req, res) => {

    // Required Fields
    let cityFlag = Boolean(req.body.cityFlag);
    let origin = String(req.body.origin);
    let destination = String(req.body.destination);

    // Optional Fields
    let email = String(req.body.email || "");
    let vehicleType = String(req.body.vehicleType || "Business");
    console.log(vehicleType);

    if (!origin || !destination) {
        return res.status(400).json({ error: "Invalid payload. Provide cityFlag, origin, and destination." });
    }
    if (cityFlag && !email) {
        return res.status(200).json({ emailRequired: true });
    }


    try {
        const distance = await calculateDistance(origin, destination);
        if (distance > 1000) {
            return res.status(200).json({
                distance: distance, message: "Too far to offer ride", emailRequired: true
            });
        }
        if (origin.indexOf(",") > 0) {
            origin = origin.substring(0, origin.indexOf(","));
        }
        const isCityExempted = NO_EMAIL_NEEDED_CITIES.includes(origin.toLowerCase());

        const pricing = pricingData.find((p) => p.city.toLowerCase() === origin.toLowerCase() && p.vehicleType.toLowerCase() === vehicleType.toLowerCase());
        const totalPrice = pricing ? pricing.baseAmount + pricing.amountPerKM * distance : 0;

        let emailNeeded = false;
        if (distance > 30 || !isCityExempted || totalPrice < 50) {
            emailNeeded = true;
        }

        if (emailNeeded && email.length == 0) {
            return res.status(200).json({ emailRequired: emailNeeded });
        }
        return res.status(200).json({ origin: origin, destination: destination, distance: distance, pricing: totalPrice });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
