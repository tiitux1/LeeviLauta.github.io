const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // Voit vaihtaa portin tarpeen mukaan

// Middlewaret
app.use(bodyParser.json());
app.use(express.static('public')); // Jos sinulla on julkisia tiedostoja (HTML, CSS, JS)


// MongoDB Atlas yhteys (vaihda omat tunnuksesi tilalle)
mongoose.connect('mongodb+srv://Tiitux:12cdsxbth4@cluster0.dpyyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.log('MongoDB connection error:', err));

// Mongoose skeema lankojen ja vastausten tallennukseen
const threadSchema = new mongoose.Schema({
    title: { type: String, required: true },    // Langan otsikko
    content: { type: String, required: true },  // Langan sisältö
    genre: { type: String, required: true },    // Genre (uutiset, urheilu, pelit, jne.)
    likes: { type: Number, default: 0 },        // Tykkäykset
    replies: [{                                  // Vastaukset tallennetaan taulukkoon
        content: { type: String },
        date: { type: Date, default: Date.now }
    }],
    date: { type: Date, default: Date.now }     // Langan luontiaika
});

// Luo malli lankojen tallentamista varten
const Thread = mongoose.model('Thread', threadSchema);

// API: Luo uusi lanka
app.post('/threads', async (req, res) => {
    const { title, content, genre } = req.body;
    try {
        const newThread = new Thread({ title, content, genre });
        await newThread.save();  // Tallenna MongoDB:hen
        res.json(newThread);     // Lähetä vastaus tallennetusta langasta
    } catch (err) {
        res.status(500).send('Error creating thread: ' + err.message);
    }
});

// API: Hae kaikki langat
app.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find();  // Hae kaikki langat
        res.json(threads);
    } catch (err) {
        res.status(500).send('Error fetching threads: ' + err.message);
    }
});

// API: Päivitä tykkäyksiä
app.post('/threads/:id/like', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (thread) {
            thread.likes += 1;
            await thread.save(); // Tallenna muutokset
            res.json(thread);
        } else {
            res.status(404).send('Thread not found');
        }
    } catch (err) {
        res.status(500).send('Error liking thread: ' + err.message);
    }
});

// API: Lisää vastaus lankaan
app.post('/threads/:id/reply', async (req, res) => {
    const { replyContent } = req.body;
    try {
        const thread = await Thread.findById(req.params.id);
        if (thread) {
            thread.replies.push({ content: replyContent });
            await thread.save();  // Tallenna uusi vastaus
            res.json(thread);
        } else {
            res.status(404).send('Thread not found');
        }
    } catch (err) {
        res.status(500).send('Error replying to thread: ' + err.message);
    }
});

// Palvelimen käynnistäminen
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
