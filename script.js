// Array to store threads
let threads = [];

// Function to add a new thread
function addThread(title, content, genre) {
    const newThread = {
        id: threads.length + 1,
        title,
        content,
        genre,
        likes: 0,
        replies: []
    };
    threads.push(newThread);
    renderThreads();
}

// Function to render threads
function renderThreads(genreFilter = null) {
    const threadList = document.getElementById('thread-list');
    threadList.innerHTML = ''; // Clear previous threads

    threads
        .filter(thread => genreFilter === null || thread.genre === genreFilter)
        .forEach(thread => {
            const threadDiv = document.createElement('div');
            threadDiv.className = 'thread';

            threadDiv.innerHTML = `
                <div class="thread-title">${thread.title} (${thread.genre})</div>
                <div class="thread-content">${thread.content}</div>
                <button class="like-button" onclick="likeThread(${thread.id})">Tykkää (${thread.likes})</button>
                <button class="reply-button" onclick="showReplyForm(${thread.id})">Vastaa</button>
                <div class="replies" id="replies-${thread.id}">
                    ${renderReplies(thread.replies)}
                </div>
            `;
            threadList.appendChild(threadDiv);
        });
}

// Function to render replies
function renderReplies(replies) {
    return replies.map(reply => `<div class="reply">${reply}</div>`).join('');
}

// Function to like a thread
function likeThread(threadId) {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        thread.likes += 1;
        renderThreads();
    }
}

// Function to show reply form
function showReplyForm(threadId) {
    const replyContent = prompt('Kirjoita vastauksesi:');
    if (replyContent) {
        addReplyToThread(threadId, replyContent);
    }
}

// Function to add a reply to a thread
function addReplyToThread(threadId, replyContent) {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        thread.replies.push(replyContent);
        renderThreads();
    }
}

// Function to handle thread form submission
document.getElementById('new-thread-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('thread-title').value;
    const content = document.getElementById('thread-content').value;
    const genre = document.getElementById('thread-genre').value;
    addThread(title, content, genre);
    document.getElementById('new-thread-form').reset();
});

// Handle DBD subscription button
document.getElementById('dbd-subscribe').addEventListener('click', function() {
    alert('Olet nyt tilannut DBD-palvelun!');
});

// Function to filter threads by genre
function filterThreads(genre) {
    renderThreads(genre);
}
