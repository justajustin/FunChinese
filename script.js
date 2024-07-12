const jokes = [
    {
        image: "images/joke_image1.jpg",
        chineseText: "［在这里插入中文笑话1］",
        englishTranslation: "[Insert English translation 1 here]",
        keywords: [
            { chinese: "词1", pinyin: "cí1", english: "word1" },
            { chinese: "词2", pinyin: "cí2", english: "word2" },
            { chinese: "词3", pinyin: "cí3", english: "word3" }
        ]
    },
    // Add more jokes here
];

const jokeImage = document.getElementById('jokeImage');
const chineseText = document.getElementById('chineseText');
const englishText = document.getElementById('englishText');
const keywords = document.getElementById('keywords');
const nextJokeBtn = document.getElementById('nextJokeBtn');
const jokeContent = document.querySelector('.joke-content');

let currentJokeIndex = -1;

function getRandomJoke() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * jokes.length);
    } while (newIndex === currentJokeIndex && jokes.length > 1);
    currentJokeIndex = newIndex;
    return jokes[currentJokeIndex];
}

function displayJoke(joke) {
    jokeImage.src = joke.image;
    jokeImage.alt = "Chinese joke image";
    chineseText.textContent = joke.chineseText;
    englishText.textContent = joke.englishTranslation;
    
    keywords.innerHTML = joke.keywords.map(word => 
        `<p><strong>${word.chinese}:</strong> ${word.pinyin} - ${word.english}</p>`
    ).join('');
}

function showNextJoke() {
    jokeContent.classList.add('fade');
    
    setTimeout(() => {
        const joke = getRandomJoke();
        displayJoke(joke);
        jokeContent.classList.remove('fade');
    }, 300);
}

nextJokeBtn.addEventListener('click', showNextJoke);

// Show the first joke on page load
showNextJoke();