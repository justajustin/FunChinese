let jokes = [];
let currentJokeIndex = -1;

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
        showNextJoke(); // Show the first joke after fetching
    } catch (error) {
        console.error('Error fetching jokes:', error);
        // You might want to display an error message to the user here
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
    jokeImage.alt = "Chinese joke image";
    chineseText.textContent = joke.chineseText;
    englishText.textContent = joke.englishTranslation;
    
    keywords.innerHTML = joke.keywords.map(word => 
        `<p><strong>${word.chinese}:</strong> ${word.pinyin} - ${word.english}</p>`
    ).join('');
}

function showNextJoke() {
    if (jokes.length === 0) {
        console.error('No jokes available');
        return;
    }

    jokeContent.classList.add('fade');
    
    setTimeout(() => {
        const joke = getRandomJoke();
        displayJoke(joke);
        jokeContent.classList.remove('fade');
    }, 300);
}

nextJokeBtn.addEventListener('click', showNextJoke);

// Fetch jokes when the page loads
fetchJokes();