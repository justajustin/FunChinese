const segmentChinese = (function(){
    const punctuation = new Set('，。！？、；：""''（）[]【】{}《》');
    return function(text) {
        return text.split('').reduce((acc, char) => {
            if (punctuation.has(char)) {
                acc.push(char);
            } else if (acc.length && !punctuation.has(acc[acc.length - 1])) {
                acc[acc.length - 1] += char;
            } else {
                acc.push(char);
            }
            return acc;
        }, []);
    };
})();

let jokes = [];
let currentJokeIndex = -1;
let nextJoke = null;
let currentJoke;
let isPlaying = false;

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

function highlightWord(index) {
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    document.querySelector(`.chinese-word[data-index="${index}"]`)?.classList.add('highlight');
    document.querySelector(`.english-word[data-index="${index}"]`)?.classList.add('highlight');
}

function playChineseAudioWithHighlight(text) {
    if (isPlaying) return;
    isPlaying = true;
    initAudioContext();
    
    const words = segmentChinese(text);
    let currentIndex = 0;
    
    function speakNextWord() {
        if (currentIndex >= words.length) {
            isPlaying = false;
            return;
        }
        
        const word = words[currentIndex];
        highlightWord(currentIndex);
        
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'zh-CN';
        
        utterance.onend = () => {
            currentIndex++;
            setTimeout(speakNextWord, 100);
        };
        
        speechSynthesis.speak(utterance);
    }
    
    speakNextWord();
}

playButton.addEventListener('click', () => {
    if (currentJoke) {
        playChineseAudioWithHighlight(currentJoke.chineseText);
    }
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
    currentJoke = joke;
    console.log('Displaying joke:', joke);
    if (jokeImage) jokeImage.src = joke.imagePath;
    if (jokeImage) jokeImage.alt = "中文笑话图片";
    
    if (chineseText && englishText) {
        const chineseWords = segmentChinese(joke.chineseText);
        const englishWords = joke.englishTranslation.split(/\s+/);
        
        chineseText.innerHTML = chineseWords.map((word, index) => 
            `<span class="word chinese-word" data-index="${index}">${word}</span>`
        ).join('');
        
        englishText.innerHTML = englishWords.map((word, index) => 
            `<span class="word english-word" data-index="${index}">${word}</span>`
        ).join(' ');
        
        playButton.style.display = 'inline-block';
    }
    
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
                playChineseAudioWithHighlight(text);
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