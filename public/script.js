const socket = io();

let threads = [];
let selectedThreadId = null;

// Luodaan uusi lanka
function createThread() {
    const title = document.getElementById('thread-title').value;
    const genre = document.getElementById('thread-genre').value;
    if (title && genre) {
        socket.emit('create thread', { title, genre });
        document.getElementById('thread-title').value = ''; // Tyhjennetään syöte
    } else {
        alert("Langan otsikko ja genre ovat pakollisia.");
    }
}

// Kun uusi lanka luodaan
socket.on('new thread', (thread) => {
    threads.push(thread);
    displayThreads(); // Päivitetään lankalistaus uusilla tiedoilla
});

// Näytetään kaikki tai genren mukaiset langat
function displayThreads(genre = 'kaikki') {
    const threadList = document.getElementById('thread-list');
    threadList.innerHTML = ''; // Tyhjennetään lankalistaus

    threads.forEach(thread => {
        if (genre === 'kaikki' || thread.genre === genre) {
            const div = document.createElement('div');
            div.className = 'thread';
            div.textContent = `${thread.title} (${thread.genre})`;
            div.onclick = () => selectThread(thread.id);
            threadList.appendChild(div);
        }
    });
}

// Suodatetaan langat genrekohtaisesti
function filterThreads(genre) {
    displayThreads(genre); // Näytetään vain valitun genren langat
}

// Kun palvelin lähettää kaikki langat yhdistäessä
socket.on('load threads', (serverThreads) => {
    threads = serverThreads;
    displayThreads(); // Näytetään kaikki langat aluksi
});

// Valitaan tietty lanka ja näytetään sen viestit
function selectThread(threadId) {
    selectedThreadId = threadId;
    const thread = threads.find(t => t.id === threadId);
    document.getElementById('thread-title-display').textContent = thread.title;
    document.getElementById('chat-container').style.display = 'block';
    displayMessages(thread.messages);
}

// Näytetään viestit valitussa langassa
function displayMessages(messages) {
    const messageList = document.getElementById('messages');
    messageList.innerHTML = ''; // Tyhjennetään aiemmat viestit
    messages.forEach(message => {
        const li = document.createElement('li');
        li.textContent = message;
        messageList.appendChild(li);
    });
}

// Lähetetään viesti valittuun lankaan
document.getElementById('message-form').onsubmit = (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message && selectedThreadId) {
        socket.emit('send message', { threadId: selectedThreadId, message });
        messageInput.value = '';
    }
};

// Kun uusi viesti lähetetään palvelimen toimesta
socket.on('new message', ({ threadId, message }) => {
    if (selectedThreadId === threadId) {
        const messageList = document.getElementById('messages');
        const li = document.createElement('li');
        li.textContent = message;
        messageList.appendChild(li);
    }
});
