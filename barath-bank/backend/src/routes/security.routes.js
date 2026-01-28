const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const securityController = require("../controllers/security.controller");

router.get("/sessions", authMiddleware, securityController.getSessions);

module.exports = router;
