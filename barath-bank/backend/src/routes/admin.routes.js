const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");

router.get(
  "/transactions/flagged",
  authMiddleware,
  adminMiddleware,
  adminController.getFlaggedTransactions
);

router.post(
  "/transactions/:id/approve",
  authMiddleware,
  adminMiddleware,
  adminController.approveTransaction
);

router.post(
  "/transactions/:id/reject",
  authMiddleware,
  adminMiddleware,
  adminController.rejectTransaction
);

module.exports = router;
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);
