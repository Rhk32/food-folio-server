const express = require("express");
const { getFeedData } = require("../controllers/feedController");
const { optionallyAuthenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET request receive
router.get("/", optionallyAuthenticateUser, getFeedData);

module.exports = router;
