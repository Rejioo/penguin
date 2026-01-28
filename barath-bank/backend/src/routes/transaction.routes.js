// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/auth.middleware");
// const transactionController = require("../controllers/transaction.controller");

// // transfer money
// router.post("/transfer", authMiddleware, transactionController.transfer);

// // transaction history
// router.get("/", authMiddleware, transactionController.getMyTransactions);

// module.exports = router;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/transaction.controller");

router.get("/", auth, controller.getMyTransactions);
router.post("/transfer", auth, controller.transfer);

module.exports = router;
