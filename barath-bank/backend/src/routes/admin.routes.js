const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const adminController = require("../controllers/admin.controller");

/**
 * Dashboard stats
 * GET /api/admin/stats
 */
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);

/**
 * Flagged transactions
 * GET /api/admin/transactions/flagged
 */
router.get(
  "/transactions/flagged",
  authMiddleware,
  adminMiddleware,
  adminController.getFlaggedTransactions
);

/**
 * Approve transaction
 * POST /api/admin/transactions/:id/approve
 */
router.post(
  "/transactions/:id/approve",
  authMiddleware,
  adminMiddleware,
  adminController.approveTransaction
);

/**
 * Reject transaction
 * POST /api/admin/transactions/:id/reject
 */
router.post(
  "/transactions/:id/reject",
  authMiddleware,
  adminMiddleware,
  adminController.rejectTransaction
);

module.exports = router;
