// Define global variables
let timeBetweenCards = null; // Holds the time between cards (in seconds)
let selectedCards = null; // Holds the number of game cards selected
let selectedOperations = []; // Holds the list of selected operations (e.g., +, -)
let selectedRanges = []; // Holds the list of selected number ranges
let allowNegatives = false; // Flag for allowing negative numbers in subtraction
let totalSum = 0; // To keep track of the total sum during the game
let gameNumbers = []; // To store the numbers generated for each card
let gameOperations = []; // To store the operations generated for each card
let currentCardIndex = 0; // To track which card is currently being displayed
let isPaused = false; // Flag to track whether the game is paused
let currentTimeout = null; // Store the timeout for card transitions

// DOM elements
const startGameButton = document.getElementById("startGame"); // Button to start the game
const gameController = document.getElementById("gameController"); // The game setup screen
const gameCard = document.getElementById("gameCard"); // The card displaying numbers and operations
const gameArea = document.getElementById("gameArea"); // The card displaying numbers and operations
const revealButton = document.getElementById("revealButton"); // Button to reveal the total sum
const pauseButton = document.getElementById("pauseGame"); // Button to pause the game
const resetButton = document.getElementById("quitIcon"); // Button to reset the game
const quitModal = document.getElementById("quitModal"); // Warning modal
const confirmQuit = document.getElementById("confirmQuit");
const cancelQuit = document.getElementById("cancelQuit");

// Set up event listeners for all button selections
function setupEventListeners() {
  // Handle operation buttons (multiple selection allowed)
  document.querySelectorAll(".operation-button").forEach((button) => {
    button.addEventListener("click", handleOperationSelection);
  });

  // Handle number range buttons (multiple selection allowed)
  document.querySelectorAll(".range-button").forEach((button) => {
    button.addEventListener("click", handleRangeSelection);
  });

  // Handle number of cards buttons (single selection)
  document.querySelectorAll(".cards-button").forEach((button) => {
    button.addEventListener("click", handleCardsSelection);
  });

  // Handle time between cards buttons (single selection)
  document.querySelectorAll(".time-button").forEach((button) => {
    button.addEventListener("click", handleTimeSelection);
  });

  // Start game button listener
  startGameButton.addEventListener("click", startGame);
}

// Handle operation button selection (multiple selections allowed)
function handleOperationSelection(event) {
  const value = event.target.getAttribute("data-value");

  // Toggle selection for operations
  if (selectedOperations.includes(value)) {
    selectedOperations = selectedOperations.filter((op) => op !== value); // Deselect
    event.target.classList.remove("selected");
  } else {
    selectedOperations.push(value); // Select
    event.target.classList.add("selected");
  }

  // Show/hide "Allow Negatives" checkbox if subtraction is selected
  const allowNegativesContainer = document.getElementById(
    "allowNegativesContainer"
  );

  if (selectedOperations.includes("subtraction")) {
    // If subtraction is selected, show the checkbox
    if (!allowNegativesContainer) {
      showAllowNegativesCheckbox(); // Create the checkbox
    }
  } else {
    // Remove the checkbox if subtraction is deselected
    if (allowNegativesContainer) {
      allowNegativesContainer.remove();
    }
  }

  console.log("Selected Operations:", selectedOperations);
}

// Handle range button selection (multiple selections allowed)
function handleRangeSelection(event) {
  const value = event.target.getAttribute("data-value");

  // Toggle selection for ranges
  if (selectedRanges.includes(value)) {
    selectedRanges = selectedRanges.filter((range) => range !== value); // Deselect
    event.target.classList.remove("selected");
  } else {
    selectedRanges.push(value); // Select
    event.target.classList.add("selected");
  }

  // Log the current state of selected ranges
  console.log("Selected Ranges:", selectedRanges);
}

// Handle number of cards button selection (single selection)
function handleCardsSelection(event) {
  // Deselect all cards buttons first
  document
    .querySelectorAll(".cards-button")
    .forEach((btn) => btn.classList.remove("selected"));

  // Select the clicked button
  selectedCards = event.target.getAttribute("data-value");
  event.target.classList.add("selected");

  // Log the selected number of cards
  console.log("Selected Number of Cards:", selectedCards);
}

// Handle time between cards button selection (single selection)
function handleTimeSelection(event) {
  // Deselect all time buttons first
  document
    .querySelectorAll(".time-button")
    .forEach((btn) => btn.classList.remove("selected"));

  // Select the clicked button
  timeBetweenCards = event.target.getAttribute("data-value");
  event.target.classList.add("selected");

  // Log the selected time between cards
  console.log("Selected Time Between Cards:", timeBetweenCards);
}

// Show "Allow Negatives" checkbox
function showAllowNegativesCheckbox() {
  const allowNegativesContainer = document.createElement("div");
  allowNegativesContainer.id = "allowNegativesContainer"; // Ensure we have a container to remove later

  const allowNegativesCheckbox = document.createElement("input");
  allowNegativesCheckbox.type = "checkbox";
  allowNegativesCheckbox.id = "allowNegatives"; // Set ID so we can reference it later

  const label = document.createElement("label");
  label.htmlFor = "allowNegatives";
  label.textContent = "Allow Negatives";

  allowNegativesContainer.appendChild(allowNegativesCheckbox);
  allowNegativesContainer.appendChild(label);

  document
    .querySelector('.operation-button[data-value="subtraction"]')
    .parentElement.appendChild(allowNegativesContainer);

  // Log that the checkbox was shown
  console.log("Allow Negatives Checkbox Shown");
}

// Initialize event listeners
setupEventListeners();

// Function to show the custom alert modal with a message
function showCustomAlert(message) {
  const customAlertModal = document.getElementById("customAlertModal");
  const customAlertMessage = document.getElementById("customAlertMessage");

  customAlertMessage.textContent = message;
  customAlertModal.style.display = "flex"; // Show the modal
}

function startGame() {
  // Add click listener to close the alert modal (only once on page load)
  document.getElementById("closeAlertButton").addEventListener("click", () => {
    const customAlertModal = document.getElementById("customAlertModal");
    customAlertModal.style.display = "none"; // Hide the modal when OK is clicked
  });
  // Check if all selections are valid before starting the game
  if (selectedOperations.length === 0) {
    showCustomAlert("Please select at least one operation.");
    return;
  }
  if (selectedRanges.length === 0) {
    showCustomAlert("Please select at least one number range.");
    return;
  }
  if (!selectedCards) {
    showCustomAlert("Please select the number of cards.");
    return;
  }
  if (!timeBetweenCards) {
    showCustomAlert("Please select the time between cards.");
    return;
  }

  // Generate game numbers and operations first
  currentCardIndex = 0;
  gameNumbers = generateGameNumbers(selectedCards); // Generate numbers for the cards
  gameOperations = generateGameOperations(selectedCards); // Generate operations for the cards

  // Generate the start number based on the selected operations and settings
  totalSum = generateStartNumber(); // Start with the starting number

  // Debugging logs to ensure numbers and operations are generated correctly
  console.log("Generated Numbers: ", gameNumbers);
  console.log("Generated Operations: ", gameOperations);
  console.log("Start Number:", totalSum);

  // Hide the game controller and start displaying the cards
  pauseButton.style.display = "inline-block";
  resetButton.style.display = "inline-block";
  gameController.style.display = "none";
  gameArea.style.display = "flex";
  updateGameCard("", totalSum); // Display the starting number (no operator)

  // Start displaying the first card after a delay
  currentTimeout = setTimeout(() => displayCard(), timeBetweenCards * 1000);
}

function displayCard() {
  if (currentCardIndex < gameNumbers.length) {
    const number = gameNumbers[currentCardIndex];
    const operation = gameOperations[currentCardIndex];
    const allowNegativesCheckbox = document.getElementById("allowNegatives");
    const allowNegatives = allowNegativesCheckbox
      ? allowNegativesCheckbox.checked
      : false;

    // Log the current operation, number, and total before update
    console.log(
      `Current Operation: ${operation}, Current Number: ${number}, Total Before Update: ${totalSum}`
    );

    // Update the total based on the operation
    if (operation === "addition") {
      totalSum += number;
    } else {
        totalSum -= number;
      }
    

    // Log the updated total after the operation
    console.log(`Updated Total: ${totalSum}`);

    // Show the card with the operation and number
    updateGameCard(operation, number);

    // Move to the next card
    currentCardIndex++;

    // Continue displaying cards after a delay
    currentTimeout = setTimeout(displayCard, timeBetweenCards * 1000);
  } else {
    // After the last card, show the "?" card
    showQuestionMark();
  }
}

// Generate random game numbers based on selected ranges
function generateGameNumbers(totalCards) {
  let numbers = [];
  for (let i = 0; i < totalCards; i++) {
    let number = getRandomNumberForRanges();
    numbers.push(number);
  }
  console.log("Generated Game Numbers: ", numbers); // Debug the generated numbers
  return numbers;
}

function generateGameOperations(totalCards) {
  let operations = [];
  for (let i = 0; i < totalCards; i++) {
    const randomOp =
      selectedOperations[Math.floor(Math.random() * selectedOperations.length)];
    operations.push(randomOp);
  }
  console.log("Generated Game Operations: ", operations); // Debug the generated operations
  return operations;
}

// Function to update the game card with the current operation and number
function updateGameCard(operation, number) {
  const operatorImg = gameCard.querySelector(".operator-png");
  const numberElement = gameCard.querySelector(".number");

  // Apply fade-out effect before changing the content
  gameCard.style.opacity = 0; // Start fade-out

  setTimeout(() => {
    // Change the content of the game card during the fade-out
    if (operation === "addition") {
      operatorImg.style.display = "block";
      operatorImg.src = "images/plus.svg"; // Path to addition SVG
    } else if (operation === "subtraction") {
      operatorImg.style.display = "block";
      operatorImg.src = "images/minus.svg"; // Path to subtraction SVG
    } else {
      operatorImg.style.display = "none"; // Hide the operator image if no operation
    }

    numberElement.textContent = number; // Update the number

    // Fade the card back in with new content
    gameCard.style.opacity = 1;
  }, 500); // 500ms delay for the fade-out effect
}

function generateStartNumber() {
  let startNumber;
  const allowNegativesCheckbox = document.getElementById("allowNegatives");
  const totalCardSum = gameNumbers.reduce((sum, num) => sum + num, 0);
  const allowNegatives = allowNegativesCheckbox
    ? allowNegativesCheckbox.checked
    : false;

  // Start number logic
  if (
    selectedOperations.includes("addition") &&
    selectedOperations.length === 1
  ) {
    // Addition only
    startNumber = getRandomNumber(5, 35);
  } else if (
    selectedOperations.includes("subtraction") &&
    selectedOperations.length === 1
  ) {
    // Subtraction only
    if (allowNegatives === false) {
      // If negatives are not allowed, start number is total sum + random number between 1 and 99
      startNumber = totalCardSum + getRandomNumber(1, 99);
    } else {
      // If negatives are allowed, start number is between 1 and half of total card sum
      startNumber = getRandomNumber(1, Math.floor(totalCardSum / 2));
    }
  } else {
    // Mixed operations (Addition and Subtraction)
    if (allowNegatives === false && selectedOperations.length === 2) {
      startNumber = totalCardSum + getRandomNumber(1, 35);
    } else {
      startNumber = getRandomNumber(1, Math.floor(totalCardSum / 2.5));
    }
  }

  return startNumber;
}

// Function to generate operations based on selected operations
function generateGameOperations(totalCards) {
  let operations = [];
  for (let i = 0; i < totalCards; i++) {
    const randomOp =
      selectedOperations[Math.floor(Math.random() * selectedOperations.length)];
    operations.push(randomOp);
  }
  return operations;
}

// Utility function to get random number based on the selected ranges
function getRandomNumberForRanges() {
  const ranges = selectedRanges.flatMap((range) => {
    const [min, max] = range.split("-").map(Number);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  });

  return ranges[Math.floor(Math.random() * ranges.length)];
}

// Utility function to get a random number between a min and max range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to show the "Play Again" button
function showPlayAgainButton() {
  // Create the "Play Again" button
  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.classList.add("default-button"); // Add any styles you want to use

  // Append the button under the game card
  gameArea.appendChild(playAgainButton);

  // Event listener for "Play Again" button
  playAgainButton.addEventListener("click", () => {
    resetGame(); // Reset the game when clicked
    playAgainButton.remove(); // Remove the button after resetting the game
  });
}

// Function to show the "?" card at the end of the game
function showQuestionMark() {
  const operatorImg = gameCard.querySelector(".operator-png");
  const numberElement = gameCard.querySelector(".number");

  operatorImg.style.display = "none"; // Hide operator image
  numberElement.textContent = "?"; // Display "?"

  // Ensure the game card is still visible
  gameCard.style.display = "flex";

  // Show the reveal button below the card
  revealButton.style.display = "block"; // Make the button visible
}

// Event listener for reveal button
revealButton.addEventListener("click", () => {
  // Replace the "?" on the game card with the total sum
  const numberElement = gameCard.querySelector(".number");
  numberElement.textContent = totalSum; // Show total sum on the card

  // Hide the reveal button after revealing the total
  revealButton.style.display = "none";

  // Show the "Play Again" button
  showPlayAgainButton();
});

////////////////////////////////////////////////////////
// Function to toggle between pause and resume
function togglePauseResume() {
  if (isPaused) {
    // Resume the game

    pauseButton.classList.remove("playing"); // Remove the "playing" class to reset the color
    currentTimeout = setTimeout(() => displayCard(), timeBetweenCards * 1000); // Resume the card transitions
  } else {
    // Pause the game
    clearTimeout(currentTimeout); // Stop the card transitions

    pauseButton.classList.add("playing"); // Add the "playing" class to change the color
  }

  isPaused = !isPaused; // Toggle the paused state
}

// Attach the pause button to the toggle function
pauseButton.addEventListener("click", togglePauseResume);

// Reset button functionality with warning modal
resetButton.addEventListener("click", () => {
  // Pause the game when reset is clicked, if not already paused
  if (!isPaused) {
    togglePauseResume(); // Pause the game
  }

  quitModal.style.display = "flex"; // Show the modal
});

// Confirm reset in modal
confirmQuit.addEventListener("click", () => {
  resetGame(); // Reset the game
  quitModal.style.display = "none"; // Hide the modal
});

// Cancel reset in modal
cancelQuit.addEventListener("click", () => {
  quitModal.style.display = "none"; // Close the modal
  // Unpause if the game was not previously paused
  if (!isPaused) {
    togglePauseResume(); // Resume the game
  }
});

// Function to reset the game to its initial state
function resetGame() {
  // Reset global variables
  totalSum = 0;
  currentCardIndex = 0;
  gameNumbers = [];
  gameOperations = [];

  // Show the game controller again
  gameController.style.display = "flex";
  gameArea.style.display = "none";
  revealButton.style.display = "none"; // Hide the reveal button

  // Hide pause and reset buttons
  pauseButton.style.display = "none";
  resetButton.style.display = "none";

  // Reset the pause state
  isPaused = false;
  pauseButton.classList.remove("playing"); // Remove the "playing" class to reset the color
}
