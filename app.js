const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const pricingRoutes = require("./routes/pricingRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/pricing", pricingRoutes);

// Root Route
app.get("/", (req, res) => {
    res.send("Pricing Module API is running...");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
