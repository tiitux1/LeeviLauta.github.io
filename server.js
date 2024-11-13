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
