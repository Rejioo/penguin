// const express = require("express");
// const cors = require("cors");
// const userRoutes = require("./routes/user.routes");
// const accountRoutes = require("./routes/account.routes");
// const authRoutes = require("./routes/auth.routes");
// const transactionRoutes = require("./routes/transaction.routes");

// const adminRoutes = require("./routes/admin.routes");



// const app = express();
// app.use(express.json());
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/accounts", accountRoutes);

// app.use("/api/user", userRoutes);
// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.set("trust proxy", true);

// app.get("/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// module.exports = app;
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

/**
 * ✅ CORS — MUST come first
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * ✅ Parse JSON once
 */
app.use(express.json());

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;


