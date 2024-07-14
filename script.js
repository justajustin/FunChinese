let jokes = [];
let currentJokeIndex = -1;
let isLoading = false; // 添加一个标志来防止重复加载

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
    if (isLoading) return; // 如果正在加载，直接返回
    isLoading = true;
    showProgressBar();
    try {
        updateProgress(20);
        console.log('Fetching jokes...');
        const response = await fetch(`./jokes_db.json?t=${new Date().getTime()}`);
        updateProgress(60);
        const data = await response.json();
        updateProgress(80);
        jokes = data.jokes;
        console.log('Loaded jokes:', jokes);
        console.log('Number of jokes loaded:', jokes.length);
        if (jokes.length === 0) {
            console.error('No jokes loaded from the file');
            return;
        }
        await showNextJoke();
        updateProgress(100);
    } catch (error) {
        console.error('Error fetching jokes:', error);
        jokeContent.innerHTML = '<p>抱歉，加载笑话时出现问题。请稍后再试。</p>';
    } finally {
        setTimeout(() => {
            hideProgressBar();
            isLoading = false;
        }, 300);
    }
}

function getRandomJoke() {
    console.log('Getting random joke. Total jokes:', jokes.length);
    if (jokes.length <= 1) return jokes[0];
    let availableJokes = jokes.filter((_, index) => index !== currentJokeIndex);
    console.log('Available jokes for selection:', availableJokes.length);
    let randomIndex = Math.floor(Math.random() * availableJokes.length);
    let selectedJoke = availableJokes[randomIndex];
    currentJokeIndex = jokes.indexOf(selectedJoke);
    console.log('Selected joke index:', currentJokeIndex);
    return selectedJoke;
}

async function displayJoke(joke) {
    console.log('Displaying joke:', joke);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            if (jokeImage) {
                jokeImage.src = img.src;
                jokeImage.alt = "中文笑话图片";
            }
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
            resolve();
        };
        img.onerror = reject;
        img.src = joke.imagePath;
    });
}

async function showNextJoke() {
    console.log('Showing next joke');
    console.log('Current number of jokes:', jokes.length);
    if (jokes.length === 0) {
        console.error('No jokes available');
        jokeContent.innerHTML = '<p>抱歉，没有可用的笑话。</p>';
        return;
    }

    try {
        jokeContent.classList.add('fade');
        showProgressBar();
        
        await new Promise(resolve => setTimeout(resolve, 300));
        updateProgress(50);

        let jokeToShow = getRandomJoke();
        console.log('Joke to show:', jokeToShow);
        await displayJoke(jokeToShow);

        updateProgress(100);
        jokeContent.classList.remove('fade');
    } catch (error) {
        console.error('Error showing next joke:', error);
        jokeContent.innerHTML = '<p>抱歉，显示笑话时出现问题。</p>';
    } finally {
        setTimeout(hideProgressBar, 300);
    }
}

async function playChineseAudio(text) {
    try {
        const response = await fetch('http://localhost:3000/tts', {
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
    if (isLoading) return; // 如果正在加载，直接返回
    console.log('Next joke button clicked. Current jokes count:', jokes.length);
    showProgressBar();
    updateProgress(20);
    await fetchJokes(); // 每次点击都重新获取笑话数据
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