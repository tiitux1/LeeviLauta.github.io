const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

let threads = [];

io.on('connection', (socket) => {
    console.log('Käyttäjä liittyi');

    // Lähetetään kaikki olemassa olevat langat uudelle käyttäjälle
    socket.emit('load threads', threads);

    // Uuden langan luonti
    socket.on('create thread', (threadData) => {
        const newThread = {
            id: Date.now(), // Luodaan yksilöllinen id aikaleimasta
            title: threadData.title,
            genre: threadData.genre,
            messages: [] // Viestit tallennetaan tähän lankaan
        };
        threads.push(newThread);
        io.emit('new thread', newThread); // Lähetetään uusi lanka kaikille
    });

    // Viestin lähetys tiettyyn lankaan
    socket.on('send message', ({ threadId, message }) => {
        const thread = threads.find(t => t.id === threadId);
        if (thread) {
            thread.messages.push(message);
            io.emit('new message', { threadId, message });
        }
    });
    
});

// Portti ja palvelimen käynnistys
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Palvelin käynnissä portissa ${PORT}`));
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Tiitux:<Toimimiseen22>@cluster0.dpyyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


