const express = require('express');
const router = express.Router();
const getuser = require('../middleware/getuser');
const Notes = require("../models/Notes")
const { body, validationResult } = require('express-validator');

//Route 1  fetch all notes for logged-in user using GET /notebook/notes/fetchallnote
router.get('/fetchallnote', getuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})

//Route 2 add new note for logged-in user using POST /notebook/notes/addnote
router.post('/addnote', getuser, [
    body('title', "Enter a valid title").isLength({ min: 5 }),
    body('description', "Enter a valid description").isLength({ min: 5 }),
], async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //If there are errors return bad request and the errors 
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ result: result.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save();
        res.json(savednote);
    }
    catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})

//Route 3 Update an existing notes for logged-in user using GET /notebook/notes/updatenote
router.put('/updatenote/:id', getuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // create a new note
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found"); }
        // Allow user to delete note only if user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})

//Route 4 Delete an existing notes for logged-in user using GET /notebook/notes/deletenode
router.delete('/deletenote/:id', getuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found"); }
        // Allow user to delete note only if user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        // if any other error occured then show it
        console.error(error.message); // idealy use logger and sqs
        res.status(500).send("Internal server error occur")
    }
})
module.exports = router;