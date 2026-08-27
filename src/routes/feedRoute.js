const express = require("express");
const { getFeedData } = require("../controllers/feedController");

const router = express.Router();

// GET request receive
router.get("/", getFeedData);

module.exports = router;
