let jokes = [];
let currentJokeIndex = -1;
let nextJoke = null;

const jokeImage = document.getElementById('jokeImage');
const chineseText = document.getElementById('chineseText');
const englishText = document.getElementById('englishText');
const keywords = document.getElementById('keywords');
const nextJokeBtn = document.getElementById('nextJokeBtn');
const jokeContent = document.querySelector('.joke-content');
const playButton = document.getElementById('playButton');

let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playChineseAudio(text) {
    initAudioContext();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    
    speechSynthesis.speak(utterance);
}

playButton.addEventListener('click', () => {
    const chineseText = document.getElementById('chineseText').textContent;
    playChineseAudio(chineseText);
});

async function fetchJokes() {
    try {
        const response = await fetch('./jokes_db.json');
        const data = await response.json();
        jokes = data.jokes;
        console.log('Loaded jokes:', jokes);
        await showNextJoke();
        preloadNextJoke();
    } catch (error) {
        console.error('Error fetching jokes:', error);
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
    console.log('Displaying joke:', joke);
    if (jokeImage) jokeImage.src = joke.imagePath;
    if (jokeImage) jokeImage.alt = "中文笑话图片";
    if (chineseText) {
        chineseText.textContent = joke.chineseText;
        playButton.style.display = 'inline-block';
    }
    if (englishText) englishText.textContent = joke.englishTranslation;
    
    if (keywords) {
        keywords.innerHTML = joke.keywords.map(word => 
            `<p>
                <strong>${word.chinese}</strong>
                <button class="play-button word-play" data-text="${word.chinese}">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                : ${word.pinyin} - ${word.english}
            </p>`
        ).join('');

        // Add play functionality for each keyword
        keywords.querySelectorAll('.word-play').forEach(button => {
            button.addEventListener('click', (e) => {
                const text = e.currentTarget.getAttribute('data-text');
                playChineseAudio(text);
            });
        });
    }
}

async function showNextJoke() {
    console.log('Showing next joke');
    if (jokes.length === 0) {
        console.error('No jokes available');
        return;
    }

    jokeContent.classList.add('fade');
    
    await new Promise(resolve => setTimeout(resolve, 300));

    let jokeToShow;
    if (nextJoke) {
        jokeToShow = nextJoke;
        nextJoke = null;
    } else {
        jokeToShow = getRandomJoke();
    }
    console.log('Joke to show:', jokeToShow);
    displayJoke(jokeToShow);

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