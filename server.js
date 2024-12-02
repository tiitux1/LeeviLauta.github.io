const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Express-sovelluksen ja palvelimen luonti
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Atlas -yhteyden parametrit
const username = encodeURIComponent("bajida3789");
const password = encodeURIComponent("283IZOaFk1WTZKL2");
const cluster = "cluster0.5vf8o.mongodb.net";
const database = "leevilauta"; // Tietokannan nimi
const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;

// Mongoose-yhteys
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB-yhteys onnistui'))
  .catch((err) => {
    console.error('MongoDB-yhteys epäonnistui:', err.message);
    process.exit(1); // Lopetetaan sovellus, jos yhteys ei toimi
  });

// Mongoose-skeema ja -malli langoille
const threadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  messages: [
    {
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Thread = mongoose.model('Thread', threadSchema);

// Palvellaan staattiset tiedostot "public"-kansiosta
app.use(express.static(__dirname + '/public'));

// Socket.IO-tapahtumien käsittely
io.on('connection', (socket) => {
  console.log('Käyttäjä liittyi');

  // Kaikkien lankojen lataus tietokannasta
  Thread.find()
    .then((threads) => {
      socket.emit('load threads', threads);
    })
    .catch((err) => {
      console.error('Virhe haettaessa lankoja:', err);
    });

  // Uuden langan luonti
  socket.on('create thread', async (threadData) => {
    try {
      const newThread = new Thread({
        title: threadData.title,
        genre: threadData.genre,
        messages: [],
      });
      await newThread.save();
      io.emit('new thread', newThread); // Lähetetään uusi lanka kaikille
    } catch (err) {
      console.error('Virhe luodessa uutta lankaa:', err);
    }
  });

  // Uuden viestin lähetys lankaan
  socket.on('send message', async ({ threadId, message }) => {
    try {
      const thread = await Thread.findById(threadId);
      if (thread) {
        const newMessage = { content: message };
        thread.messages.push(newMessage);
        await thread.save();
        io.emit('new message', { threadId, message: newMessage }); // Lähetetään viesti kaikille
      }
    } catch (err) {
      console.error('Virhe lisättäessä viestiä lankaan:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Käyttäjä poistui');
  });
});

// Palvelimen käynnistys
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Palvelin käynnissä portissa ${PORT}`)
);