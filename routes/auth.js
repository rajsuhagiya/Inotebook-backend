const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Create a User using: POST "/api/auth/createuser" - No Login Required
router.post(
  "/createuser",
  [
    body("name", "Name must be 3 charachters").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must be 5 charachters").isLength({ min: 5 }),
  ],
  async (req, res) => {
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
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      res.status(200).json({ message: "Successfully created a user" });
    } catch (error) {
      res.status(500).json({ error: "Some error occured" });
    }
  }
);

module.exports = router;
