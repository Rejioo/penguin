// // const express = require("express");
// // const router = express.Router();

// // const authMiddleware = require("../middleware/auth.middleware");

// // // protected route
// // router.get("/me", authMiddleware, (req, res) => {
// //   res.json({
// //     message: "Authenticated user",
// //     user: req.user,
// //   });
// // });

// // module.exports = router;
// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth.middleware");

// router.get("/me", auth, (req, res) => {
//   res.json({
//     id: req.user.userId,
//     email: req.user.email,
//     role: req.user.role,
//   });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/me", authMiddleware, userController.getMe);

module.exports = router;
