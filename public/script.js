const socket = io();

// Tallennetaan kaikki langat ja valittu lanka
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
    displayThreads();
});

// Näytetään langat
function displayThreads() {
    const threadList = document.getElementById('thread-list');
    threadList.innerHTML = ''; // Tyhjennetään aiempi lista
    threads.forEach(thread => {
        const div = document.createElement('div');
        div.className = 'thread';
        div.textContent = `${thread.title} (${thread.genre})`;
        div.onclick = () => selectThread(thread.id);
        threadList.appendChild(div);
    });
}

// Kun palvelin lähettää kaikki langat yhdistäessä
socket.on('load threads', (serverThreads) => {
    threads = serverThreads;
    displayThreads();
});

// Valitaan tietty lanka ja näytetään sen viestit
function selectThread(threadId) {
    selectedThreadId = threadId;
    const thread = threads.find(t => t.id === threadId);
    document.getElementById('chat-container').style.display = 'block';
    document.getElementById('thread-title-display').textContent = thread.title;
    displayMessages(thread.messages);
}

// Viestien näyttäminen valitussa langassa
function displayMessages(messages) {
    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';
    messages.forEach(message => {
        const li = document.createElement('li');
        li.textContent = message;
        messageList.appendChild(li);
    });
}

// Lähetetään viesti valittuun lankaan
document.getElementById('message-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    if (input.value && selectedThreadId !== null) {
        socket.emit('send message', { threadId: selectedThreadId, message: input.value });
        input.value = ''; // Tyhjennetään syötekenttä
    } else {
        alert("Kirjoita viesti ennen lähettämistä.");
    }
});

// Vastaanotetaan uusi viesti ja näytetään se
socket.on('new message', ({ threadId, message }) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        thread.messages.push(message);
        if (threadId === selectedThreadId) {
            displayMessages(thread.messages);
        }
    }
});

// Kun yhteys muodostetaan, ladataan langat
socket.on('connect', () => {
    socket.emit('request threads'); // Lähetetään pyyntö langoista heti, kun yhteys muodostetaan
});
