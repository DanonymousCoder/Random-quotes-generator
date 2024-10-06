// DOM
const quoteText = document.getElementById('quote');
const newQuoteButton = document.getElementById('generate');
const categorySelect = document.getElementById('category');
const shareTwitterButton = document.getElementById('shareTwitter');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const copyQuoteButton = document.getElementById('copy-quote');
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
    ]
};

// event listener
newQuoteButton.addEventListener("click", newQuote);
darkModeToggle.addEventListener('click', toggleDarkMode);
copyQuoteButton.addEventListener('click',copyQuote);
// newQuote function
function newQuote() {
    const selectedCategory = categorySelect.value;  // Get the selected category from the dropdown
    const categoryQuotes = quotes[selectedCategory];  // Get quotes from the selected category
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length);  // Get a random quote index
    const selectedQuote = categoryQuotes[randomIndex];  // Get the random quote from the selected category

    typeWriterEffect(selectedQuote);
}

// Function to implement typewriter effect
function typeWriterEffect(text) {
    let i = 0;
    quoteText.innerHTML = '';  // Clear previous quote
    const speed = 50;  // Speed of typewriter effect in milliseconds
  
    function typeWriter() {
      if (i < text.length) {
        quoteText.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);  // Call the function recursively
      }
    }
  
    typeWriter();
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Event listener for the Share on Twitter button
shareTwitterButton.addEventListener("click", shareQuoteOnTwitter);

// Function to share the quote on Twitter
function shareQuoteOnTwitter() {
    const selectedQ = quoteText.innerText;  // Get the currently displayed quote
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedQ)}%20%23QuotesGenerator`;
    
    window.open(twitterUrl, '_blank');  // Open the Twitter share dialog
}

function copyQuote(){
  const quote = quoteText.innerText; //Extract the quote from the div
  if (quote==="Your quote will appear here..."){ //in case no quote is generated do not copy anything
    alert('Generate a quote first');
    return 1;
  }
  navigator.clipboard.writeText(quote); //copy quote to the clipboard
  alert("Quote Copied");
  return 0;
}