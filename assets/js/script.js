const FAVORITES_KEY = "favoriteQuotes";
const HISTORY_KEY = "quoteHistory";
const THEME_HISTORY_KEY = "themeHistory";
const MAX_HISTORY = 10;

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
const quoteThemesDiv = document.getElementById("quote-themes");
const themeButtonsContainer = document.getElementById("theme-buttons");

// 历史记录面板 DOM - 延迟获取确保DOM已加载
let historyToggle, historyContent, historyIcon, historyList;
let recommendList, recommendThemes;

function initDOMElements() {
  historyToggle = document.getElementById("history-toggle");
  historyContent = document.getElementById("history-content");
  historyIcon = document.getElementById("history-icon");
  historyList = document.getElementById("history-list");
  recommendList = document.getElementById("recommend-list");
  recommendThemes = document.getElementById("recommend-themes");
  
  console.log('DOM元素初始化:');
  console.log('historyToggle:', !!historyToggle);
  console.log('historyContent:', !!historyContent);
  console.log('historyList:', !!historyList);
  console.log('recommendList:', !!recommendList);
}

// 所有可用的主题标签
const allThemes = ["人生", "成功", "智慧", "幽默", "爱情", "友谊", "成长", "梦想"];

// quotes array - 每条名言包含主题标签
const quotes = {
  motivational: [
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela",
      themes: ["人生", "成长"]
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      themes: ["成功", "梦想"]
    },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      author: "Steve Jobs",
      themes: ["人生", "智慧"]
    }
  ],
  funny: [
    {
      text: "I'm not arguing, I'm just explaining why I'm right.",
      author: "Unknown",
      themes: ["幽默"]
    },
    {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      author: "Unknown",
      themes: ["幽默"]
    },
    {
      text: "My fake plants died because I did not pretend to water them.",
      author: "Mitch Hedberg",
      themes: ["幽默", "人生"]
    }
  ],
  inspirational: [
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
      themes: ["人生", "智慧"]
    },
    {
      text: "If you look at what you have in life, you'll always have more.",
      author: "Oprah Winfrey",
      themes: ["人生", "智慧"]
    },
    {
      text: "If life were predictable it would cease to be life, and be without flavor.",
      author: "Eleanor Roosevelt",
      themes: ["人生", "成长"]
    }
  ],
};

// 当前选中的主题（多选）
let selectedThemes = [];

// event listener
newQuoteButton.addEventListener("click", newQuote);
darkModeToggle.addEventListener("click", toggleDarkMode);
copyQuoteButton.addEventListener("click", copyQuote);
favoriteIcon.addEventListener("click", toggleFavorite);

// 根据选中的主题筛选名言
function getFilteredQuotes() {
  const selectedCategory = categorySelect.value;
  const categoryQuotes = quotes[selectedCategory];
  
  // 如果没有选择任何主题或选择了"全部"，返回所有名言
  if (selectedThemes.length === 0) {
    return categoryQuotes;
  }
  
  // 筛选包含至少一个选中主题的名言
  return categoryQuotes.filter(quote => {
    return quote.themes && quote.themes.some(theme => selectedThemes.includes(theme));
  });
}

// 显示名言的主题标签
function displayQuoteThemes(themes) {
  if (!themes || themes.length === 0) {
    quoteThemesDiv.innerHTML = '';
    return;
  }
  
  const themesHtml = themes.map(theme => 
    `<span class="theme-tag">${theme}</span>`
  ).join('');
  quoteThemesDiv.innerHTML = themesHtml;
}

// 初始化主题按钮事件监听
function initThemeButtons() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      
      if (theme === 'all') {
        // 点击"全部"按钮时，清空所有选中主题
        selectedThemes = [];
        themeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      } else {
        // 点击其他主题按钮
        const allButton = document.querySelector('[data-theme="all"]');
        allButton.classList.remove('active');
        
        if (selectedThemes.includes(theme)) {
          // 如果已选中，则取消选中
          selectedThemes = selectedThemes.filter(t => t !== theme);
          button.classList.remove('active');
        } else {
          // 如果未选中，则添加选中
          selectedThemes.push(theme);
          button.classList.add('active');
        }
        
        // 如果没有选中任何主题，自动选中"全部"
        if (selectedThemes.length === 0) {
          allButton.classList.add('active');
        }
      }
      
      // 重新生成符合筛选条件的名言
      newQuote();
    });
  });
}

// newQuote function
async function newQuote() {
  // Disable the button to prevent multiple clicks
  buttonDisabled("true");

  // Set the icon to orange while a new quote is generating
  favoriteIcon.style.color = "#ef8354"; // 주황색으로 설정

  // 获取筛选后的名言列表
  const filteredQuotes = getFilteredQuotes();
  
  // 如果没有符合条件的名言，显示提示
  if (filteredQuotes.length === 0) {
    quoteText.innerHTML = "当前筛选条件下没有名言，请尝试其他主题组合。";
    authorText.textContent = "";
    quoteThemesDiv.innerHTML = "";
    authorImage.src = "./assets/images/default.jpg";
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
  
  // 显示主题标签
  displayQuoteThemes(selectedQuote.themes);

  // Fetch images from Wikipedia
  const authorImageUrl = await fetchWikipediaImage(selectedQuote.author);
  authorImage.src = authorImageUrl;
  
  // 添加到历史记录
  addToHistory(selectedQuote);
  
  // 记录用户筛选的主题偏好
  recordThemePreference(selectedQuote.themes);
  
  // 更新推荐列表
  updateRecommendations();
}

// ==================== 历史记录功能 ====================

// 初始化历史记录面板
function initHistoryPanel() {
  console.log('初始化历史记录面板');
  
  if (!historyToggle || !historyContent || !historyIcon) {
    console.error('历史记录面板DOM元素不存在');
    return;
  }
  
  // 加载并显示历史记录
  renderHistory();
  
  // 默认折叠历史记录面板
  historyContent.classList.add('collapsed');
  
  // 绑定折叠/展开事件
  historyToggle.addEventListener('click', () => {
    console.log('点击历史记录头部，当前折叠状态:', historyContent.classList.contains('collapsed'));
    historyContent.classList.toggle('collapsed');
    historyIcon.classList.toggle('fa-chevron-down');
    historyIcon.classList.toggle('fa-chevron-up');
  });
}

// 添加名言到历史记录
function addToHistory(quote) {
  console.log('添加名言到历史记录:', quote.text.substring(0, 30) + '...');
  
  let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  console.log('当前历史记录数量:', history.length);
  
  // 检查是否已存在相同名言
  const exists = history.some(item => item.text === quote.text);
  if (exists) {
    console.log('名言已存在，跳过添加');
    return;
  }
  
  // 添加新记录到开头
  history.unshift({
    text: quote.text,
    author: quote.author,
    themes: quote.themes || [],
    timestamp: new Date().toISOString()
  });
  
  // 限制历史记录数量
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// 渲染历史记录列表
function renderHistory() {
  if (!historyList) {
    console.error('historyList 元素不存在');
    return;
  }
  
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  console.log('渲染历史记录，数量:', history.length);
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">暂无历史记录</p>';
    return;
  }
  
  const historyHtml = history.map((item, index) => {
    const themesHtml = (item.themes || []).map(theme => 
      `<span class="history-theme-tag">${theme}</span>`
    ).join('');
    
    return `
      <div class="history-item" data-index="${index}">
        <div class="history-quote">"${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"</div>
        <div class="history-meta">
          <span class="history-author">— ${item.author}</span>
          <div class="history-themes">${themesHtml}</div>
        </div>
      </div>
    `;
  }).join('');
  
  historyList.innerHTML = historyHtml;
  
  // 绑定点击事件，点击历史记录可以重新显示该名言
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      const selectedQuote = history[index];
      
      if (selectedQuote) {
        quoteText.innerHTML = selectedQuote.text;
        authorText.textContent = selectedQuote.author;
        displayQuoteThemes(selectedQuote.themes);
        updateFavoriteIconColor();
      }
    });
  });
}

// ==================== 推荐名言功能 ====================

// 记录用户主题偏好
function recordThemePreference(themes) {
  if (!themes || themes.length === 0) return;
  
  let themeHistory = JSON.parse(localStorage.getItem(THEME_HISTORY_KEY)) || {};
  
  themes.forEach(theme => {
    themeHistory[theme] = (themeHistory[theme] || 0) + 1;
  });
  
  localStorage.setItem(THEME_HISTORY_KEY, JSON.stringify(themeHistory));
}

// 获取用户最感兴趣的主题
function getTopThemes(count = 3) {
  const themeHistory = JSON.parse(localStorage.getItem(THEME_HISTORY_KEY)) || {};
  
  // 按浏览次数排序
  const sortedThemes = Object.entries(themeHistory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([theme]) => theme);
  
  return sortedThemes;
}

// 更新推荐列表
function updateRecommendations() {
  if (!recommendList) {
    console.error('recommendList 元素不存在');
    return;
  }
  
  const topThemes = getTopThemes(3);
  console.log('更新推荐，用户关注主题:', topThemes);
  
  if (topThemes.length === 0) {
    recommendList.innerHTML = '<p class="empty-recommend">浏览更多名言以获取个性化推荐</p>';
    if (recommendThemes) recommendThemes.textContent = '';
    return;
  }
  
  // 显示推荐依据的主题
  recommendThemes.textContent = `基于您关注的：${topThemes.join('、')}`;
  
  // 从所有分类中查找包含这些主题的名言
  const allQuotes = [];
  Object.values(quotes).forEach(categoryQuotes => {
    allQuotes.push(...categoryQuotes);
  });
  
  // 获取历史记录，排除已浏览的名言
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  const historyTexts = history.map(h => h.text);
  
  // 筛选包含用户感兴趣主题的名言
  const recommendedQuotes = allQuotes.filter(quote => {
    // 排除已浏览的
    if (historyTexts.includes(quote.text)) return false;
    
    // 检查是否包含用户感兴趣的主题
    return quote.themes && quote.themes.some(theme => topThemes.includes(theme));
  });
  
  // 随机选择最多3条推荐
  const shuffled = recommendedQuotes.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  if (selected.length === 0) {
    recommendList.innerHTML = '<p class="empty-recommend">已为您展示所有相关名言，继续探索其他主题吧！</p>';
    return;
  }
  
  // 渲染推荐列表
  const recommendHtml = selected.map((quote, index) => {
    const themesHtml = (quote.themes || []).map(theme => 
      `<span class="recommend-theme-tag">${theme}</span>`
    ).join('');
    
    // 将名言数据存储在 data 属性中，避免闭包问题
    const quoteData = encodeURIComponent(JSON.stringify(quote));
    
    return `
      <div class="recommend-item" data-quote="${quoteData}">
        <div class="recommend-quote">"${quote.text.substring(0, 60)}${quote.text.length > 60 ? '...' : ''}"</div>
        <div class="recommend-meta">
          <span class="recommend-author">— ${quote.author}</span>
          <div class="recommend-themes">${themesHtml}</div>
        </div>
      </div>
    `;
  }).join('');
  
  recommendList.innerHTML = recommendHtml;
  
  // 绑定点击事件
  recommendList.querySelectorAll('.recommend-item').forEach(item => {
    item.addEventListener('click', () => {
      const quoteData = item.getAttribute('data-quote');
      const quote = JSON.parse(decodeURIComponent(quoteData));
      
      if (quote) {
        quoteText.innerHTML = quote.text;
        authorText.textContent = quote.author;
        displayQuoteThemes(quote.themes);
        addToHistory(quote);
        recordThemePreference(quote.themes);
        updateFavoriteIconColor();
      }
    });
  });
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

// 初始化DOM元素
initDOMElements();

// Initial icon color setup when the page loads
updateFavoriteIconColor();

// 初始化主题按钮
initThemeButtons();

// 初始化历史记录面板
initHistoryPanel();

// 初始化推荐列表
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