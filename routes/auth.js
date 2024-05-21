const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const router = express.Router();

const JWT_SECRET = "https.inotebook";

// ROUTE 1: Create a User using: POST "/api/auth/createuser" - No Login Required
router.post(
  "/createuser",
  [
    body("name", "Name must be 3 charachters").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must be 5 charachters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email is alredt exists" });
      }
      const salt = bcrypt.genSaltSync(10);
      secPass = bcrypt.hashSync(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      // res.status(200).json({ message: "Successfully created a user" });
      res.status(200).json({ success, authtoken });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 2: Authenticate a User using: POST "/api/auth/login" - No Login Required
router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    try {
      let success = false;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: "Please try to login with correct credentials",
        });
        // .json({ error: "email and password is incorrect" });
      }
      const passwordCompare = bcrypt.compareSync(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "email and password is incorrect" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.status(200).json({ success, authtoken });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Get login user details using: POST "/api/auth/getuser" - Login Required

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
