let jokes = [];
let currentJokeIndex = -1;
let nextJoke = null;

const jokeImage = document.getElementById('jokeImage');
const chineseText = document.getElementById('chineseText');
const englishText = document.getElementById('englishText');
const keywords = document.getElementById('keywords');
const nextJokeBtn = document.getElementById('nextJokeBtn');
const jokeContent = document.querySelector('.joke-content');

// 在 fetchJokes 函数中添加时间戳以防止缓存
async function fetchJokes() {
    try {
        const response = await fetch(`./jokes_db.json?t=${new Date().getTime()}`);
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

// 修改 getRandomJoke 函数以确保不重复
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
    if (chineseText) chineseText.textContent = joke.chineseText;
    if (englishText) englishText.textContent = joke.englishTranslation;
    
    if (keywords) {
        keywords.innerHTML = joke.keywords.map(word => 
            `<p><strong>${word.chinese}:</strong> ${word.pinyin} - ${word.english}</p>`
        ).join('');
    }
}

// 在 showNextJoke 函数中添加更多日志
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

// 确保每次点击按钮时都重新获取笑话
nextJokeBtn.addEventListener('click', async () => {
    await fetchJokes(); // 重新加载笑话数据
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

const playButton = document.getElementById('playButton');
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 修改 script.js 中的 playChineseAudio 函数

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
        // 如果AI语音失败，可以回退到浏览器API
        fallbackToBrowserTTS(text);
    }
}

function fallbackToBrowserTTS(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
}

playButton.addEventListener('click', () => {
    const chineseText = document.getElementById('chineseText').textContent;
    playChineseAudio(chineseText);
});

function displayJoke(joke) {
    console.log('Displaying joke:', joke);
    if (jokeImage) jokeImage.src = joke.imagePath;
    if (jokeImage) jokeImage.alt = "中文笑话图片";
    if (chineseText) {
        chineseText.textContent = joke.chineseText;
        playButton.style.display = 'inline-block'; // 显示播放按钮
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

        // 为每个关键词添加播放功能
        keywords.querySelectorAll('.word-play').forEach(button => {
            button.addEventListener('click', (e) => {
                const text = e.currentTarget.getAttribute('data-text');
                playChineseAudio(text);
            });
        });
    }
}