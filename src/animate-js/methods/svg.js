// Import anime.js as a module
import anime from 'https://unpkg.com/animejs@3.2.1/lib/anime.es.js';

export const svg = {
  /**
   * Morphs from one SVG to another.
   * @param {string} element - The CSS selector for the container element.
   * @param {string} initialSvg - The initial SVG string.
   * @param {string} finalSvg - The final SVG string.
   * @param {Object} [options] - Options for the animation.
   */
  morph: function (element, initialSvg, finalSvg, options = {}) {
    const {
      duration = 1000,
      easing = 'linear',
      direction = 'normal',
      iterations = 1,
    } = options;

    // Add the initial SVG to the DOM
    const container = document.querySelector(element);
    container.innerHTML = initialSvg;

    // Extract path data from final SVG
    const parser = new DOMParser();
    const finalDoc = parser.parseFromString(finalSvg, 'image/svg+xml');
    const paths = Array.from(finalDoc.querySelectorAll('path'));

    if (paths.length === 0) {
      console.error('No path elements found in final SVG.');
      return;
    }

    const finalPathData = paths.map(path => path.getAttribute('d')).join(' ');

    if (!finalPathData) {
      console.error('No path data found in final SVG.');
      return;
    }

    // Animate path morph
    anime({
      targets: `${element} path`,
      d: [
        { value: finalPathData }
      ],
      duration: duration,
      easing: easing,
      loop: iterations !== 1,
      direction: direction,
    });
  },

  /**
   * Draws an SVG from nothing.
   * @param {string} element - The CSS selector for the container element.
   * @param {string} svgContent - The SVG content string.
   * @param {Object} [options] - Options for the drawing animation.
   */
  draw: function (element, svgContent, options = {}) {
    const {
      duration = 1000,
      easing = 'linear',
      direction = 'normal',
      iterations = 1,
    } = options;

    // Create an SVG element and add it to the DOM
    const container = document.querySelector(element);
    container.innerHTML = svgContent;

    // Use anime.js to animate the drawing
    anime({
      targets: `${element} path`,
      strokeDasharray: function (el) {
        return el.getTotalLength();
      },
      strokeDashoffset: function (el) {
        return el.getTotalLength();
      },
      duration: duration,
      easing: easing,
      loop: iterations !== 1,
      direction: direction,
    });
  },
  /**
  * Animates an element along a motion path.
  * @param {string} element - The CSS selector for the container element.
  * @param {string} pathSelector - The CSS selector for the path element.
  * @param {Object} [options] - Options for the animation.
  * @param {Object} [motionPathOptions] - The motion applied like translateY, X, scale, 
  */
  motion: function (
    element,
    pathSelector,
    options = {},
    motionPathOptions = {}) {
    // Default options
    const {
      duration = 1000,
      easing = 'linear',
      loop = false,
      direction = 'normal',
    } = options;

    // Create a path function from anime.js
    const path = anime.path(pathSelector);

    // Animate the element along the path
    anime({
      targets: element,
      easing: easing,
      duration: duration,
      ...motionPathOptions,
      loop: loop,
      direction: direction,
      update: function (anim) {
        // console.log(anim.progress);
      }
    });

    return { path, options };
  },

  /**
  * Draws an SVG line from start to end (similar to draw but named for clarity).
  * @param {string} element - The CSS selector for the container element.
  * @param {string} svgContent - The SVG content string.
  * @param {Object} [options] - Options for the drawing animation.
  */
  lineDraw: function (element, svgContent, options = {}) {
    const {
      duration = 1000,
      easing = 'easeInOutSine',
      direction = 'normal',
      iterations = 1,
    } = options;

    // Create an SVG element and add it to the DOM
    const container = document.querySelector(element);
    container.innerHTML = svgContent;

    // Use anime.js to animate the drawing of the lines
    anime({
      targets: `${element} path`,
      delay: function(element, i)  {
        return i * 100;
      },
      strokeDasharray: function (element) {
        return element.getTotalLength();
      },
      strokeDashoffset: [function (element) {
        return element.getTotalLength();
      }, 0], // Animate from full length to 0 to draw the line
      duration: duration,
      easing: easing,
      loop: iterations !== 1,
      direction: direction,
    });
  }
};