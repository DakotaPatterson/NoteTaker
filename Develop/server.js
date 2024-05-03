const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


//Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, '/public/assets')));

// Path to the db.json file
const dbFilePath = path.join(__dirname, 'db', 'db.json');

const PORT = process.env.PORT || 3001;

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'))
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    try {
      const notes = JSON.parse(data);
      res.json(notes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
  });
});

app.post('/api/notes', (req, res) => {
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

      // Parse the existing notes data
    let notes = JSON.parse(data);

     // Create a new note object with a unique ID
    const newNote = {
      id: uuidv4(), // Generate unique ID for the new note
      title: req.body.title,
      text: req.body.text
    };

    // Push the new note to the array of notes
    notes.push(newNote);

    // Write the updated notes data back to the database file
    fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Respond with the newly created note
      res.json(newNote);
    });
  });
});

// DELETE /api/notes/:id - Delete a note by its ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    let notes = JSON.parse(data);

    // Find the index of the note with the given ID
    const index = notes.findIndex(note => note.id === noteId);

    if (index === -1) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Remove the note from the array
    notes.splice(index, 1);

    // Write the updated notes data back to the file
    fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(204).end(); // Respond with status 204 (No Content) on successful deletion
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});