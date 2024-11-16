const FAVORITES_KEY = "favoriteQuotes";

// DOM
const quoteText = document.getElementById("quote");
const newQuoteButton = document.getElementById("generate");
const categorySelect = document.getElementById("category");
const shareTwitterButton = document.getElementById("shareTwitter");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const copyQuoteButton = document.getElementById("copy-quote");
const favoriteIcon = document.getElementById("favorite-icon");
// quotes array
const quotes = {
  motivational: [
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Your time is limited, so don’t waste it living someone else’s life. - Steve Jobs",
  ],
  funny: [
    "I'm not arguing, I'm just explaining why I'm right.",
    "Why don’t skeletons fight each other? They don’t have the guts.",
    "My fake plants died because I did not pretend to water them. - Mitch Hedberg",
  ],
  inspirational: [
    "Life is what happens when you’re busy making other plans. - John Lennon",
    "If you look at what you have in life, you’ll always have more. - Oprah Winfrey",
    "If life were predictable it would cease to be life, and be without flavor. - Eleanor Roosevelt",
  ],
};

// event listener
newQuoteButton.addEventListener("click", newQuote);
darkModeToggle.addEventListener("click", toggleDarkMode);
copyQuoteButton.addEventListener("click", copyQuote);
favoriteIcon.addEventListener("click", toggleFavorite);

// newQuote function
function newQuote() {
  // Disable the button to prevent multiple clicks
  buttonDisabled("true");

  // Set the icon to orange while a new quote is generating
  favoriteIcon.style.color = "#ef8354"; // 주황색으로 설정

  const selectedCategory = categorySelect.value; // Get the selected category from the dropdown
  const categoryQuotes = quotes[selectedCategory]; // Get quotes from the selected category
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length); // Get a random quote index
  const selectedQuote = categoryQuotes[randomIndex]; // Get the random quote from the selected category

  // Enable the button after the quote is fully displayed
  setTimeout(() => {
    buttonDisabled("false");
  }, selectedQuote.length * 50); // Adjust the delay based on typewriter speed and quote length

  typeWriterEffect(selectedQuote, updateFavoriteIconColor);
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
