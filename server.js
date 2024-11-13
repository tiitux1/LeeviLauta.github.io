const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Tallennetaan luodut keskustelulangat palvelimen muistiin
let threads = [];

// Palvellaan staattiset tiedostot
app.use(express.static('public'));

// Kun uusi asiakas liittyy
io.on('connection', (socket) => {
    console.log('Käyttäjä liittyi');

    // Lähetetään kaikki langat uudelle käyttäjälle
    socket.emit('load threads', threads);

    // Uuden langan luonti
    socket.on('create thread', (threadData) => {
        const newThread = {
            id: threads.length, // Luodaan yksilöllinen id
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

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Palvelin käynnissä osoitteessa http://localhost:${PORT}`);
});
