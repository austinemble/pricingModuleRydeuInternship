const express = require("express");
const router = express.Router();
const { checkEmail } = require("../controller/pricingController");

// Endpoint: POST /api/pricing/check-email
router.post("/check-email", checkEmail);

module.exports = router;
