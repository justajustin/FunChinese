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
const progressBar = document.getElementById('progressBar');
const progress = progressBar.querySelector('.progress');

let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function showProgressBar() {
    progressBar.style.display = 'block';
    progress.style.width = '0%';
}

function updateProgress(percent) {
    progress.style.width = `${percent}%`;
}

function hideProgressBar() {
    progressBar.style.display = 'none';
}

async function fetchJokes() {
    showProgressBar();
    try {
        updateProgress(20);
        const response = await fetch(`./jokes_db.json?t=${new Date().getTime()}`);
        updateProgress(60);
        const data = await response.json();
        updateProgress(80);
        jokes = data.jokes;
        console.log('Loaded jokes:', jokes);
        await showNextJoke();
        updateProgress(100);
        preloadNextJoke();
    } catch (error) {
        console.error('Error fetching jokes:', error);
        jokeContent.innerHTML = '<p>抱歉，加载笑话时出现问题。请稍后再试。</p>';
    } finally {
        setTimeout(hideProgressBar, 300);
    }
}

function getRandomJoke() {
    if (jokes.length <= 1) return jokes[0];
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * jokes.length);
    } while (newIndex === currentJokeIndex);
    currentJokeIndex = newIndex;
    console.log('Selected joke index:', currentJokeIndex);
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
    showProgressBar();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    updateProgress(50);

    let jokeToShow;
    if (nextJoke) {
        jokeToShow = nextJoke;
        nextJoke = null;
    } else {
        jokeToShow = getRandomJoke();
    }
    console.log('Joke to show:', jokeToShow);
    displayJoke(jokeToShow);

    updateProgress(100);
    jokeContent.classList.remove('fade');
    setTimeout(hideProgressBar, 300);
}

function preloadNextJoke() {
    nextJoke = getRandomJoke();
    if (nextJoke.imagePath) {
        const img = new Image();
        img.src = nextJoke.imagePath;
    }
}

async function playChineseAudio(text) {
    try {
        const response = await fetch('/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error('Error playing audio:', error);
        fallbackToBrowserTTS(text);
    }
}

function fallbackToBrowserTTS(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
}

nextJokeBtn.addEventListener('click', async () => {
    showProgressBar();
    updateProgress(20);
    await fetchJokes();
    updateProgress(60);
    await showNextJoke();
    updateProgress(80);
    preloadNextJoke();
    updateProgress(100);
    setTimeout(hideProgressBar, 300);
});

playButton.addEventListener('click', () => {
    const chineseText = document.getElementById('chineseText').textContent;
    playChineseAudio(chineseText);
});

fetchJokes();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}