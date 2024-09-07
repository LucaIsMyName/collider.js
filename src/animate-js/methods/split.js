/**
 * Animates a block of text by splitting it into words, lines, or characters.
 *
 * @param {HTMLElement} element - The HTML element containing the text to animate.
 * @param {Object} options - Configuration options for the animation.
 * @param {Object} options.keyframes - Keyframe animation for spans.
 * @param {string} options.split - How to split the text: "words", "chars", or "lines".
 * @param {string} options.direction - Animation direction (e.g. "normal", "reverse").
 * @param {number} options.iterations - Number of times to run the animation.
 * @param {Function} options.callback - Callback after animation finishes.
 * @param {number} options.stag - Time delay between each element's animation start.
 * @param {number} options.duration - Total duration of the animation.
 * @param {number} options.delay - Initial delay before animation starts.
 * @param {string} options.easing - Easing function for the animation.
 * @param {Object} options.scrollTrigger - Optional scroll-trigger settings.
 * @param {Function} options.onUpdate - Callback for animation progress updates.
 */
export function split(
  element,
  options = {
    keyframes: {
      0: { opacity: 0 },
      100: { opacity: 1 }
    },
    split: 'words', // words, chars, lines
    direction: 'normal',
    iterations: 1,
    callback: null,
    stag: 0, // time between each iteration (defaulted to 0)
    duration: 1000, // duration of the animation
    delay: 0, // delay (defaulted to 0)
    easing: 'linear', // easing function
    scrollTrigger: {
      active: false,
      timeline: 'view',
      timelineParams: 'block',
    },
    onUpdate: null
  }
) {
  // 1. Split the text content based on the 'split' option
  const text = element.innerText;
  let splitElements = [];

  if (options.split === 'words') {
    // Split text into words
    splitElements = text.split(' ').map((word) => `<span style="opacity: 0">${word}</span>`);
  } else if (options.split === 'chars') {
    // Split text into characters
    splitElements = text.split('').map((char) => `<span style="opacity: 0">${char}</span>`);
  } else if (options.split === 'lines') {
    // Split text into lines (simple approximation)
    splitElements = text.split('\n').map((line) => `<span style="opacity: 0">${line}</span>`);
  }

  // 2. Replace the original text with the wrapped spans (initial state: hidden)
  element.innerHTML = splitElements.join(' ');

  const spans = element.querySelectorAll('span');
  const animations = [];

  // Ensure delay and stag are numbers (avoid NaN)
  const delay = options.delay || 0;
  const stag = options.stag || 0;

  // 3. Create and pause each span element's animation initially
  spans.forEach((span, index) => {
    const keyframesArray = Object.keys(options.keyframes).map((key) => ({
      offset: key / 100,
      ...options.keyframes[key],
    }));

    const animation = span.animate(keyframesArray, {
      duration: options.duration,
      delay: delay + index * stag,
      easing: options.easing,
      iterations: options.iterations,
      direction: options.direction,
      fill: 'forwards',
    });

    // Pause the animation initially
    animation.pause();

    animations.push(animation);
  });

  // If scrollTrigger is enabled, manage scroll-based animations
  if (options.scrollTrigger && options.scrollTrigger.active) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play animations when the element is in view
            animations.forEach((animation) => animation.play());
          } else {
            // Optionally cancel animations when out of view
            animations.forEach((animation) => animation.cancel());
          }
        });
      },
      {
        threshold: 0.5, // Adjust visibility threshold (0.5 = half visible)
      }
    );

    observer.observe(element);
  }
}
