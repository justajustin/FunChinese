let jokes = [];
let currentJokeIndex = -1;
let nextJoke = null;

const jokeImage = document.getElementById('jokeImage');
const chineseText = document.getElementById('chineseText');
const englishText = document.getElementById('englishText');
const keywords = document.getElementById('keywords');
const nextJokeBtn = document.getElementById('nextJokeBtn');
const jokeContent = document.querySelector('.joke-content');

async function fetchJokes() {
    try {
        const response = await fetch('jokes_db.json');
        const data = await response.json();
        jokes = data.jokes;
        await showNextJoke();
        preloadNextJoke();
    } catch (error) {
        console.error('Error fetching jokes:', error);
        // Display a user-friendly error message
        jokeContent.innerHTML = '<p>抱歉，加载笑话时出现问题。请稍后再试。</p>';
    }
}

function getRandomJoke() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * jokes.length);
    } while (newIndex === currentJokeIndex && jokes.length > 1);
    currentJokeIndex = newIndex;
    return jokes[currentJokeIndex];
}

function displayJoke(joke) {
    jokeImage.src = joke.imagePath;
    jokeImage.alt = "中文笑话图片";
    chineseText.textContent = joke.chineseText;
    englishText.textContent = joke.englishTranslation;
    
    keywords.innerHTML = joke.keywords.map(word => 
        `<p><strong>${word.chinese}:</strong> ${word.pinyin} - ${word.english}</p>`
    ).join('');
}

async function showNextJoke() {
    if (jokes.length === 0) {
        console.error('No jokes available');
        return;
    }

    jokeContent.classList.add('fade');
    
    await new Promise(resolve => setTimeout(resolve, 300));

    if (nextJoke) {
        displayJoke(nextJoke);
        nextJoke = null;
    } else {
        const joke = getRandomJoke();
        displayJoke(joke);
    }

    jokeContent.classList.remove('fade');
}

function preloadNextJoke() {
    nextJoke = getRandomJoke();
    if (nextJoke.imagePath) {
        const img = new Image();
        img.src = nextJoke.imagePath;
    }
}

nextJokeBtn.addEventListener('click', async () => {
    await showNextJoke();
    preloadNextJoke();
});

// Fetch jokes when the page loads
fetchJokes();

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}