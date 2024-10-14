// DOM
const quoteText = document.getElementById("quote");
const newQuoteButton = document.getElementById("generate");
const categorySelect = document.getElementById("category");
const shareTwitterButton = document.getElementById("shareTwitter");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const copyQuoteButton = document.getElementById("copy-quote");
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
// newQuote function
function newQuote() {
  const selectedCategory = categorySelect.value; // Get the selected category from the dropdown
  const categoryQuotes = quotes[selectedCategory]; // Get quotes from the selected category
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length); // Get a random quote index
  const selectedQuote = categoryQuotes[randomIndex]; // Get the random quote from the selected category

  typeWriterEffect(selectedQuote);
}

// Function to implement typewriter effect
function typeWriterEffect(text) {
  let i = 0;
  quoteText.innerHTML = ""; // Clear previous quote
  const speed = 50; // Speed of typewriter effect in milliseconds

  function typeWriter() {
    if (i < text.length) {
      quoteText.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed); // Call the function recursively
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
    newQuoteButton.disabled = true;
    // Toggle the class to disable the button and cursor not allowed
    newQuoteButton.classList.toggle("btnDisabled");
    shareTwitterButton.disabled = true;
    shareTwitterButton.classList.toggle("btnDisabled");
    copyQuoteButton.disabled = true;
    copyQuoteButton.classList.toggle("btnDisabled");
    categorySelect.disabled = true;
    categorySelect.classList.toggle("btnDisabled");
  } else {
    newQuoteButton.disabled = false;
    shareTwitterButton.disabled = false;
    copyQuoteButton.disabled = false;
    categorySelect.disabled = false;
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
