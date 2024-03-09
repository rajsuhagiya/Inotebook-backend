const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult, header, param } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

// ROUTE 1: Create All the Notes using: GET "/api/auth/fetchallnotes" - Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
  res.send(notes);
});

// ROUTE 2: Add a new Note using: POST "/api/auth/addnote" - Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a Valid title").isLength({ min: 3 }),
    body("description", "Enter a Valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;

      const note = new Note({ title, description, tag, user: req.user.id });
      const savedNote = await note.save();
      res.send(savedNote);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Update a existing note using: POST "/api/auth/updatenote" - Login Required
router.put(
  "/updatenote/:id",
  fetchuser,
  // [param("id", "Enter a Valid Id").exists()],
  async (req, res) => {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }
      const { title, description, tag } = req.body;
      const newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }

      // Find the note to be updated
      let note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not Found");
      }

      // Allow updation only if user owns this Note
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 4: Delete a existing note using: POST "/api/auth/deletenote" - Login Required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be updated
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
