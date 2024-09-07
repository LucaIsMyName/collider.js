import { getRandomChar } from './utils.js';
/**
 * 
 * @param {HTMLElement | string} element 
 * @param {string} text 
 * @param {number} speed 
 * @param {boolean} fuzzy 
 * @param {boolean} deleteSome 
 * @param {number} index 
 * @returns {void}
 * @example
 * typewriter('.element', 'Hello, World!', 100, false, true, 0);
 * 
 * @description
 * Typewriter effect for a given element.
 */
export function typewriter(element, text, speed = 100, fuzzy = false, deleteSome = true, index = 0) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  // Randomize the speed slightly if fuzzy is true
  const adjustedSpeed = fuzzy ? Math.random() * speed + speed * 0.5 : speed;

  // Function to handle the insertion and correction of characters
  function insertCharacter(correctChar, index) {
    // Type the correct character
    element.textContent += correctChar;
    setTimeout(() => {
      if (Math.random() < 0.05 && deleteSome) { // 10% chance to insert a wrong character
        const wrongChar = getRandomChar(); // Get a random wrong character

        // Immediately correct the wrong character
        element.textContent += wrongChar; // Add wrong character
        setTimeout(() => {
          element.textContent = element.textContent.slice(0, -1); // Remove wrong character
          setTimeout(() => {
            // Continue typing the correct character
            typewriter(element, text, speed, fuzzy, deleteSome, index + 1);
          }, adjustedSpeed);
        }, adjustedSpeed * 2);
      } else {
        // No wrong character, continue typing the next character
        typewriter(element, text, speed, fuzzy, deleteSome, index + 1);
      }
    }, adjustedSpeed);
  }

  // Start typing
  if (index < text.length) {
    insertCharacter(text.charAt(index), index);
  }
}
