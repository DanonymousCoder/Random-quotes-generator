const FAVORITES_KEY = "favoriteQuotes";
const HISTORY_KEY = "quoteHistory";
const RECENT_TAGS_KEY = "recentTags";
const MAX_HISTORY = 20;

// DOM
const quoteText = document.getElementById("quote");
const newQuoteButton = document.getElementById("generate");
const categorySelect = document.getElementById("category");
const shareTwitterButton = document.getElementById("shareTwitter");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const copyQuoteButton = document.getElementById("copy-quote");
const favoriteIcon = document.getElementById("favorite-icon");
const authorText = document.getElementById("author");
const authorImage = document.getElementById("author-image");
const quoteTagsContainer = document.getElementById("quote-tags");
const tagFilterContainer = document.getElementById("tag-filter-container");
const historyToggle = document.getElementById("history-toggle");
const historyContent = document.getElementById("history-content");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");
const recommendContent = document.getElementById("recommend-content");

let selectedTags = new Set();
let allTags = new Set();

// quotes array
const quotes = {
  motivational: [
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela",
      tags: ["perseverance", "success", "life"]
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      tags: ["action", "success", "beginning"]
    },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      author: "Steve Jobs",
      tags: ["life", "time", "authenticity"]
    }
  ],
  funny: [
    {
      text: "I'm not arguing, I'm just explaining why I'm right.",
      author: "Unknown",
      tags: ["humor", "arguments", "confidence"]
    },
    {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      author: "Unknown",
      tags: ["humor", "puns", "silly"]
    },
    {
      text: "My fake plants died because I did not pretend to water them.",
      author: "Mitch Hedberg",
      tags: ["humor", "irony", "life"]
    }
  ],
  inspirational: [
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
      tags: ["life", "planning", "mindfulness"]
    },
    {
      text: "If you look at what you have in life, you'll always have more.",
      author: "Oprah Winfrey",
      tags: ["gratitude", "life", "positivity"]
    },
    {
      text: "If life were predictable it would cease to be life, and be without flavor.",
      author: "Eleanor Roosevelt",
      tags: ["life", "adventure", "uncertainty"]
    }
  ],
};

// event listener
newQuoteButton.addEventListener("click", newQuote);
darkModeToggle.addEventListener("click", toggleDarkMode);
copyQuoteButton.addEventListener("click", copyQuote);
favoriteIcon.addEventListener("click", toggleFavorite);

// newQuote function
async function newQuote() {
  // Disable the button to prevent multiple clicks
  buttonDisabled("true");

  // Set the icon to orange while a new quote is generating
  favoriteIcon.style.color = "#ef8354"; // 주황색으로 설정

  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    alert("没有符合条件的名言，请重新选择主题标签");
    buttonDisabled("false");
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  // Enable the button after the quote is fully displayed
  setTimeout(() => {
    buttonDisabled("false");
  }, selectedQuote.text.length * 60); // Adjust the delay based on typewriter speed and quote length

  typeWriterEffect(selectedQuote.text, updateFavoriteIconColor);
  authorText.textContent = selectedQuote.author;
  displayQuoteTags(selectedQuote.tags);
  
  saveToHistory(selectedQuote);
  updateRecentTags(selectedQuote.tags);
  updateRecommendations();

  // Fetch images from Wikipedia
  const authorImageUrl = await fetchWikipediaImage(selectedQuote.author);
  authorImage.src = authorImageUrl;
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

function collectAllTags() {
  for (const category in quotes) {
    quotes[category].forEach(quote => {
      if (quote.tags) {
        quote.tags.forEach(tag => allTags.add(tag));
      }
    });
  }
}

function initTagButtons() {
  collectAllTags();
  
  const allBtn = tagFilterContainer.querySelector('[data-tag="all"]');
  allBtn.addEventListener("click", () => toggleTagFilter("all"));
  
  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-btn";
    btn.dataset.tag = tag;
    btn.textContent = tag;
    btn.addEventListener("click", () => toggleTagFilter(tag));
    tagFilterContainer.appendChild(btn);
  });
}

function toggleTagFilter(tag) {
  const allBtn = tagFilterContainer.querySelector('[data-tag="all"]');
  
  if (tag === "all") {
    selectedTags.clear();
    document.querySelectorAll(".tag-btn").forEach(btn => btn.classList.remove("active"));
    allBtn.classList.add("active");
  } else {
    allBtn.classList.remove("active");
    
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
    
    document.querySelectorAll(".tag-btn:not([data-tag='all'])").forEach(btn => {
      if (selectedTags.has(btn.dataset.tag)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    if (selectedTags.size === 0) {
      allBtn.classList.add("active");
    }
  }
}

function getFilteredQuotes() {
  const selectedCategory = categorySelect.value;
  const categoryQuotes = quotes[selectedCategory];
  
  if (selectedTags.size === 0) {
    return categoryQuotes;
  }
  
  return categoryQuotes.filter(quote => {
    if (!quote.tags) return false;
    return quote.tags.some(tag => selectedTags.has(tag));
  });
}

function displayQuoteTags(tags) {
  quoteTagsContainer.innerHTML = "";
  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "quote-tag";
      tagSpan.textContent = `#${tag}`;
      quoteTagsContainer.appendChild(tagSpan);
    });
  }
}

initTagButtons();

// History Panel Functions
function initHistoryPanel() {
  historyToggle.addEventListener("click", toggleHistoryPanel);
  clearHistoryBtn.addEventListener("click", clearHistory);
  renderHistory();
}

function toggleHistoryPanel() {
  historyToggle.classList.toggle("collapsed");
  historyContent.classList.toggle("collapsed");
}

function saveToHistory(quote) {
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  
  const historyItem = {
    text: quote.text,
    author: quote.author,
    tags: quote.tags || [],
    timestamp: Date.now()
  };
  
  history.unshift(historyItem);
  
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  
  if (history.length === 0) {
    historyList.innerHTML = '<div class="recommend-empty">暂无历史记录</div>';
    return;
  }
  
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-item-text">"${item.text}"</div>
      <div class="history-item-author">— ${item.author}</div>
      ${item.tags && item.tags.length > 0 ? `
        <div class="history-item-tags">
          ${item.tags.map(tag => `<span class="history-item-tag">#${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function clearHistory() {
  if (confirm("确定要清空所有历史记录吗？")) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
}

// Recent Tags Functions
function updateRecentTags(tags) {
  if (!tags || tags.length === 0) return;
  
  let recentTags = JSON.parse(localStorage.getItem(RECENT_TAGS_KEY)) || [];
  
  tags.forEach(tag => {
    const existingIndex = recentTags.findIndex(t => t.name === tag);
    if (existingIndex !== -1) {
      recentTags[existingIndex].count++;
      recentTags[existingIndex].lastUsed = Date.now();
    } else {
      recentTags.push({ name: tag, count: 1, lastUsed: Date.now() });
    }
  });
  
  recentTags.sort((a, b) => b.count - a.count);
  recentTags = recentTags.slice(0, 10);
  
  localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(recentTags));
}

function getRecentTags() {
  return JSON.parse(localStorage.getItem(RECENT_TAGS_KEY)) || [];
}

// Recommendation Functions
function updateRecommendations() {
  const recentTags = getRecentTags();
  const recommendContent = document.getElementById("recommend-content");
  
  if (recentTags.length === 0) {
    recommendContent.innerHTML = '<div class="recommend-empty">开始筛选主题后，将为您推荐相关名言</div>';
    return;
  }
  
  const topTags = recentTags.slice(0, 3).map(t => t.name);
  const recommendations = getRecommendationsByTags(topTags);
  
  if (recommendations.length === 0) {
    recommendContent.innerHTML = '<div class="recommend-empty">暂无匹配的推荐名言</div>';
    return;
  }
  
  recommendContent.innerHTML = recommendations.slice(0, 5).map(quote => `
    <div class="recommend-item" onclick="selectRecommendQuote('${quote.text.replace(/'/g, "\\'")}')">
      <div class="recommend-item-text">"${quote.text}"</div>
      <div class="recommend-item-author">— ${quote.author}</div>
    </div>
  `).join('');
}

function getRecommendationsByTags(tags) {
  const recommendations = [];
  
  for (const category in quotes) {
    quotes[category].forEach(quote => {
      if (quote.tags && quote.tags.some(tag => tags.includes(tag))) {
        if (!recommendations.find(r => r.text === quote.text)) {
          recommendations.push(quote);
        }
      }
    });
  }
  
  return recommendations;
}

function selectRecommendQuote(selectedText) {
  for (const category in quotes) {
    const found = quotes[category].find(q => q.text === selectedText);
    if (found) {
      quoteText.innerHTML = "";
      typeWriterEffect(found.text, updateFavoriteIconColor);
      authorText.textContent = found.author;
      displayQuoteTags(found.tags);
      fetchWikipediaImage(found.author).then(url => {
        authorImage.src = url;
      });
      break;
    }
  }
}

initHistoryPanel();
updateRecommendations();

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