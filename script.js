// Simulated database of jokes
const jokes = [
    {
        image: "joke_image1.jpg",
        chineseText: "［在这里插入中文笑话1］",
        englishTranslation: "[Insert English translation 1 here]",
        keywords: [
            { chinese: "词1", pinyin: "cí1", english: "word1" },
            { chinese: "词2", pinyin: "cí2", english: "word2" },
            { chinese: "词3", pinyin: "cí3", english: "word3" }
        ]
    },
    {
        image: "joke_image2.jpg",
        chineseText: "［在这里插入中文笑话2］",
        englishTranslation: "[Insert English translation 2 here]",
        keywords: [
            { chinese: "词4", pinyin: "cí4", english: "word4" },
            { chinese: "词5", pinyin: "cí5", english: "word5" },
            { chinese: "词6", pinyin: "cí6", english: "word6" }
        ]
    },
    // Add more jokes as needed
];

let currentJokeIndex = -1;

function createJokeElement(joke) {
    const jokeElement = document.createElement('div');
    jokeElement.className = 'joke';
    jokeElement.innerHTML = `
        <h2>今日笑话 / Today's Joke</h2>
        <img src="${joke.image}" alt="Chinese joke image">
        <h3>Chinese Text:</h3>
        <p>${joke.chineseText}</p>
        <h3>English Translation:</h3>
        <p>${joke.englishTranslation}</p>
        <h3>Key Words:</h3>
        <div class="keywords">
            ${joke.keywords.map(word => `
                <p><strong>${word.chinese}:</strong> ${word.pinyin} - ${word.english}</p>
            `).join('')}
        </div>
    `;
    return jokeElement;
}

function showNextJoke() {
    const container = document.getElementById('jokeContainer');
    const oldJoke = container.firstChild;
    
    // Select a random joke that's not the current one
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * jokes.length);
    } while (newIndex === currentJokeIndex && jokes.length > 1);
    
    currentJokeIndex = newIndex;
    const newJoke = createJokeElement(jokes[currentJokeIndex]);
    
    // Position the new joke
    newJoke.style.transform = 'translateX(100%)';
    container.appendChild(newJoke);
    
    // Trigger reflow
    newJoke.offsetHeight;
    
    // Slide out the old joke and slide in the new one
    if (oldJoke) {
        oldJoke.style.transform = 'translateX(-100%)';
    }
    newJoke.style.transform = 'translateX(0)';
    
    // Remove the old joke after transition
    setTimeout(() => {
        if (oldJoke) {
            container.removeChild(oldJoke);
        }
    }, 500);
}

// Show the first joke on page load
showNextJoke();
