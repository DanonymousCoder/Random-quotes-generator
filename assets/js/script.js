const FAVORITES_KEY = "favoriteQuotes";
const ALL_TOPICS = ["全部", "励志", "幽默", "人生", "成功", "智慧", "勇气", "梦想", "坚持", "态度"];
const HISTORY_KEY = "quoteHistory";
const TOPIC_STATS_KEY = "topicStats";
let selectedTopics = ["全部"];
let currentQuote = null;

document.addEventListener("DOMContentLoaded", function() {
  const quoteText = document.getElementById("quote");
  const newQuoteButton = document.getElementById("generate");
  const categorySelect = document.getElementById("category");
  const shareTwitterButton = document.getElementById("shareTwitter");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const copyQuoteButton = document.getElementById("copy-quote");
  const favoriteIcon = document.getElementById("favorite-icon");
  const authorText = document.getElementById("author");
  const authorImage = document.getElementById("author-image");
  const historyToggle = document.getElementById("history-toggle");
  const historyPanel = document.getElementById("history-panel");
  const historyOverlay = document.getElementById("history-overlay");
  const clearHistory = document.getElementById("clear-history");
  const closeHistory = document.getElementById("close-history");

  const quotes = {
  motivational: [
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela",
      topics: ["励志", "勇气", "坚持"],
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      topics: ["励志", "行动", "成功"],
    },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      author: "Steve Jobs",
      topics: ["人生", "励志", "梦想"],
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill",
      topics: ["成功", "勇气", "坚持"],
    },
    {
      text: "The only limit to our realization of tomorrow will be our doubts of today.",
      author: "Franklin D. Roosevelt",
      topics: ["励志", "梦想", "态度"],
    },
    {
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
      topics: ["坚持", "励志", "成功"],
    }
  ],
  funny: [
    {
      text: "I'm not arguing, I'm just explaining why I'm right.",
      author: "Unknown",
      topics: ["幽默", "智慧"],
    },
    {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      author: "Unknown",
      topics: ["幽默"],
    },
    {
      text: "My fake plants died because I did not pretend to water them.",
      author: "Mitch Hedberg",
      topics: ["幽默"],
    },
    {
      text: "The only way to keep your health is to eat what you don't want, drink what you don't like, and do what you'd rather not.",
      author: "Mark Twain",
      topics: ["幽默", "人生"],
    },
    {
      text: "I have not failed. I've just found 10,000 ways that won't work.",
      author: "Thomas Edison",
      topics: ["幽默", "励志", "成功"],
    },
    {
      text: "A day without sunshine is like, you know, night.",
      author: "Steve Martin",
      topics: ["幽默", "智慧"],
    }
  ],
  inspirational: [
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
      topics: ["人生", "智慧"],
    },
    {
      text: "If you look at what you have in life, you'll always have more.",
      author: "Oprah Winfrey",
      topics: ["人生", "态度", "成功"],
    },
    {
      text: "If life were predictable it would cease to be life, and be without flavor.",
      author: "Eleanor Roosevelt",
      topics: ["人生", "智慧", "态度"],
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      topics: ["人生", "态度", "智慧"],
    },
    {
      text: "Get busy living or get busy dying.",
      author: "Stephen King",
      topics: ["人生", "勇气", "励志"],
    },
    {
      text: "You only live once, but if you do it right, once is enough.",
      author: "Mae West",
      topics: ["人生", "梦想", "态度"],
    },
    {
      text: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
      author: "Thomas Edison",
      topics: ["成功", "坚持", "励志"],
    },
    {
      text: "If you want to live a happy life, tie it to a goal, not to people or things.",
      author: "Albert Einstein",
      topics: ["梦想", "成功", "人生"],
    }
  ],
};

function getAllQuotes() {
  return [...quotes.motivational, ...quotes.funny, ...quotes.inspirational];
}

function getQuotesByTopics(topics) {
  if (topics.length === 0 || topics.includes("全部")) {
    return getAllQuotes();
  }
  return getAllQuotes().filter(quote => 
    topics.some(topic => quote.topics.includes(topic))
  );
}

function initTopicButtons() {
  const topicButtons = document.querySelectorAll(".topic-btn");
  topicButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic;
      
      if (topic === "全部") {
        selectedTopics = ["全部"];
        topicButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        if (selectedTopics.includes("全部")) {
          selectedTopics = [];
          topicButtons.forEach(b => b.classList.remove("active"));
        }
        
        if (selectedTopics.includes(topic)) {
          selectedTopics = selectedTopics.filter(t => t !== topic);
          btn.classList.remove("active");
        } else {
          selectedTopics.push(topic);
          btn.classList.add("active");
        }
        
        if (selectedTopics.length === 0) {
          selectedTopics = ["全部"];
          document.querySelector('.topic-btn[data-topic="全部"]').classList.add("active");
        }
      }
      
      recordTopicStats(selectedTopics);
      updateRecommendedPanel();
    });
  });
}

function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

function saveHistory(quote) {
  const history = getHistory();
  const exists = history.find(h => h.text === quote.text);
  if (!exists) {
    history.unshift(quote);
    if (history.length > 50) {
      history.pop();
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

function updateHistoryPanel() {
  const historyList = document.getElementById("history-list");
  const history = getHistory();
  
  if (history.length === 0) {
    historyList.innerHTML = '<p style="text-align:center;color:#888;">暂无历史记录</p>';
    return;
  }
  
  historyList.innerHTML = history.map((quote, index) => `
    <div class="history-item" data-index="${index}">
      <div class="history-item-text">${quote.text}</div>
      <div class="history-item-author">— ${quote.author}</div>
    </div>
  `).join("");
  
  historyList.querySelectorAll(".history-item").forEach(item => {
    item.addEventListener("click", function() {
      const index = parseInt(this.dataset.index);
      const quote = history[index];
      displayQuoteDirectly(quote);
    });
  });
}

function displayQuoteDirectly(quote) {
  quoteText.innerHTML = quote.text;
  authorText.textContent = quote.author;
  currentQuote = quote;
  updateFavoriteIconColor();
  
  fetchWikipediaImage(quote.author).then(url => {
    authorImage.src = url;
  });
}

function recordTopicStats(topics) {
  const stats = JSON.parse(localStorage.getItem(TOPIC_STATS_KEY)) || {};
  const topicsWithoutAll = topics.filter(t => t !== "全部");
  
  if (topicsWithoutAll.length > 0) {
    topicsWithoutAll.forEach(topic => {
      stats[topic] = (stats[topic] || 0) + 1;
    });
    localStorage.setItem(TOPIC_STATS_KEY, JSON.stringify(stats));
  }
}

function getTopTopics(n = 3) {
  const stats = JSON.parse(localStorage.getItem(TOPIC_STATS_KEY)) || {};
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(item => item[0]);
}

function updateRecommendedPanel() {
  const recommendedList = document.getElementById("recommended-list");
  const topTopics = getTopTopics(3);
  
  if (topTopics.length === 0) {
    recommendedList.innerHTML = '<p style="text-align:center;color:#888;">选择主题后将为您推荐</p>';
    return;
  }
  
  const relevantQuotes = getQuotesByTopics(topTopics);
  const shuffled = [...relevantQuotes].sort(() => Math.random() - 0.5);
  const recommended = shuffled.slice(0, 3);
  
  recommendedList.innerHTML = recommended.map((quote, index) => `
    <div class="recommended-item" data-index="${index}">
      ${quote.text}
    </div>
  `).join("");
  
  recommendedList.querySelectorAll(".recommended-item").forEach((item, index) => {
    item.addEventListener("click", () => {
      displayQuoteDirectly(recommended[index]);
    });
  });
}

function initHistoryPanelToggle() {
  const historyToggle = document.getElementById("history-toggle");
  const historyPanel = document.getElementById("history-panel");
  const historyOverlay = document.getElementById("history-overlay");
  const clearHistory = document.getElementById("clear-history");
  const closeHistory = document.getElementById("close-history");
  
  function openHistoryPanel() {
    historyPanel.classList.add("open");
    historyOverlay.classList.add("show");
    updateHistoryPanel();
  }
  
  function closeHistoryPanel() {
    historyPanel.classList.remove("open");
    historyOverlay.classList.remove("show");
  }
  
  historyToggle.addEventListener("click", () => {
    if (historyPanel.classList.contains("open")) {
      closeHistoryPanel();
    } else {
      openHistoryPanel();
    }
  });
  
  closeHistory.addEventListener("click", closeHistoryPanel);
  historyOverlay.addEventListener("click", closeHistoryPanel);
  
  clearHistory.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    updateHistoryPanel();
  });
}

// event listener
newQuoteButton.addEventListener("click", newQuote);
initTopicButtons();
initHistoryPanelToggle();
darkModeToggle.addEventListener("click", toggleDarkMode);
copyQuoteButton.addEventListener("click", copyQuote);
favoriteIcon.addEventListener("click", toggleFavorite);

async function newQuote() {
  buttonDisabled("true");
  favoriteIcon.style.color = "#ef8354";

  const filteredQuotes = getQuotesByTopics(selectedTopics);
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];
  currentQuote = selectedQuote;

  setTimeout(() => {
    buttonDisabled("false");
  }, selectedQuote.text.length * 60);

  typeWriterEffect(selectedQuote.text, updateFavoriteIconColor);
  authorText.textContent = selectedQuote.author;

  const authorImageUrl = await fetchWikipediaImage(selectedQuote.author);
  authorImage.src = authorImageUrl;

  saveHistory(selectedQuote);
}

// Function to implement typewriter effect
function typeWriterEffect(text, callback) {
  let i = 0;
  quoteText.innerHTML = ""; // Clear previous quote
  const speed = 50; // Speed of typewriter effect in milliseconds

  function typeWriter() {
    if (i < text.length) {
      quoteText.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed); // Call the function recursively
    } else if (callback) {
      callback(); // Call callback after typing effect is complete
    }
  }

  typeWriter();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Event listener for the Share on Twitter button
shareTwitterButton.addEventListener("click", shareQuoteOnTwitter);

// Function to share the quote on Twitter
function shareQuoteOnTwitter() {
  const selectedQ = quoteText.innerText; // Get the currently displayed quote
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    selectedQ
  )}%20%23QuotesGenerator`;

  window.open(twitterUrl, "_blank"); // Open the Twitter share dialog
}

// Function to copy the quote to the clipboard
function copyQuote() {
  const quote = quoteText.innerText; // Extract the quote from the div

  // Check if the quote is the default message
  if (quote === "Your quote will appear here...") {
    alert("Generate a quote first"); // Alert the user to generate a quote
    return; // Early return if the default message is displayed
  }

  // Check if the Clipboard API is supported
  if (!navigator.clipboard) {
    alert("Clipboard API not supported"); // Alert the user if Clipboard API is not supported
    return; // Early return if Clipboard API is not supported
  }

  // Copy the quote to the clipboard and handle the promise
  navigator.clipboard
    .writeText(quote)
    .then(() => {
      alert("Quote Copied"); // Alert the user on successful copy
    })
    .catch((err) => {
      console.error("Failed to copy: ", err); // Log the error to the console
      alert("Failed to copy quote"); // Alert the user on failure to copy
    });
}

// Function to disable the button while fetching quotes from the server
// Prevents multiple button clicks
function buttonDisabled(temp) {
  if (temp === "true") {
    // Add the class to disable the button and cursor not allowed
    newQuoteButton.disabled = true;
    newQuoteButton.classList.add("btnDisabled");
    shareTwitterButton.disabled = true;
    shareTwitterButton.classList.add("btnDisabled");
    copyQuoteButton.disabled = true;
    copyQuoteButton.classList.add("btnDisabled");
    categorySelect.disabled = true;
    categorySelect.classList.add("btnDisabled");
    document.getElementById("gen-ai").disabled = true;
    document.getElementById("gen-ai").classList.add("btnDisabled");
  } else {
    newQuoteButton.disabled = false;
    newQuoteButton.classList.remove("btnDisabled");
    shareTwitterButton.disabled = false;
    shareTwitterButton.classList.remove("btnDisabled");
    copyQuoteButton.disabled = false;
    copyQuoteButton.classList.remove("btnDisabled");
    categorySelect.disabled = false;
    categorySelect.classList.remove("btnDisabled");
    document.getElementById("gen-ai").disabled = false;
    document.getElementById("gen-ai").classList.remove("btnDisabled");
  }
}

document.getElementById("gen-ai").addEventListener("click", async () => {
  const category = document.getElementById("category").value;
  buttonDisabled("true"); // callling function to disable the button

  // Fetch quotes from the server
  try {
    const response = await fetch("http://localhost:3000/generate-ai-quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Store the AI quotes in local storage
    localStorage.setItem("aiQuotes", JSON.stringify(data.quotes));

    // Redirect to ai.html
    window.location.href = "ai.html";
  } catch (error) {
    console.error("Error fetching AI quotes:", error);
    alert("Failed to generate quotes. Please try again later.");
  }

  buttonDisabled("false"); // calling function to enable the button
});

// Toggle favorite status of the current quote
function toggleFavorite() {
  const quote = quoteText.innerText;

  if (quote === "Your quote will appear here...") {
    alert("Please generate a quote first!");
    return;
  }

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  if (favorites.includes(quote)) {
    const index = favorites.indexOf(quote);
    favorites.splice(index, 1);
    alert("Quote removed from favorites!");
  } else {
    favorites.push(quote);
    alert("Quote added to favorites!");
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  updateFavoriteIconColor(); // Update icon color based on new favorite status
}

// Check if the quote is already favorited
function isQuoteFavorited(quote) {
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  return favorites.includes(quote);
}

// Update the icon color based on favorite status
function updateFavoriteIconColor() {
  const quote = quoteText.innerText;
  favoriteIcon.style.color = isQuoteFavorited(quote) ? "yellow" : "#ef8354";
}

// Initial icon color setup when the page loads
updateFavoriteIconColor();
updateRecommendedPanel();

// Wikipedia API request function
async function fetchWikipediaImage(authorName) {
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=${encodeURIComponent(authorName)}&pithumbsize=200`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data from Wikipedia");
    }

    const data = await response.json();
    const pages = data.query.pages;

    // Extract thumbnail URL
    for (const pageId in pages) {
      if (pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }

    return "./assets/images/default.jpg"; // Return default image if none exists
  } catch (error) {
    console.error("Error fetching Wikipedia image:", error);
    return "./assets/images/default.jpg"; // Handle errors
  }
}
});