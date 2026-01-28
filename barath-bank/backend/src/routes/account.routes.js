// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/auth.middleware");
// const accountController = require("../controllers/account.controller");

// // create account (once)
// router.post("/", authMiddleware, accountController.createAccount);

// // get logged-in user's account
// router.get("/me", authMiddleware, accountController.getMyAccount);

// module.exports = router;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/account.controller");

// create primary account
router.post("/", auth, controller.createAccount);

// get ALL accounts of logged-in user
router.get("/", auth, controller.getMyAccounts);

// get SINGLE account by id
router.get("/:id", auth, controller.getAccountById);

module.exports = router;
