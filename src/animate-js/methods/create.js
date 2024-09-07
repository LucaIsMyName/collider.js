import {
  computeScrollPositions,
  calculatePosition,
  addScrollMarkers
} from "./scroll.js";

import {
  camelToKebab,
  kebabToCamel
} from "./utils.js";

// Singleton style manager for storing all keyframes and timelines
const styleManager = (() => {
  let styleElement = null;

  return {
    getStyleElement: () => {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.setAttribute('id', 'animate-js-keyframes');
        document.head.appendChild(styleElement);
      }
      return styleElement;
    },
    appendCSS: (css) => {
      const styleEl = styleManager.getStyleElement();
      styleEl.innerHTML += css;
    },
    removeKeyframes: (keyframesName) => {
      const styleEl = styleManager.getStyleElement();
      styleEl.innerHTML = styleEl.innerHTML.replace(
        new RegExp(`@keyframes\\s+${keyframesName}\\s*\\{[^}]*\\}`, 'g'),
        ''
      );
      styleEl.innerHTML = styleEl.innerHTML.replace(
        new RegExp(`@scroll-timeline\\s+${keyframesName}\\s*\\{[^}]*\\}`, 'g'),
        ''
      );
    }
  };
})();

/**
 * 
 * @param {HTMLElement | string} element 
 * @param {Object} options 
 * @param {number} options.iterations
 * @param {string} options.direction
 * @param {number} options.duration
 * @param {number} options.delay
 * @param {string} options.easing
 * @param {number} options.stag
 * @param {Object} options.keyframes
 * @param {Function} options.callback
 * @param {Object} options.scrollTrigger
 * @param {boolean} options.scrollTrigger.active
 * @param {string} options.scrollTrigger.timeline
 * @param {string} options.scrollTrigger.timelineParams
 * @param {Function} options.onUpdate
 * @returns {Object}
 */

export function create(
  element = 'body',
  options = {}
) {
  const {
    iterations = 1,
    direction = 'normal',
    duration = 1000,
    delay = 0,
    easing = 'linear',
    stag = 0,
    keyframes = { 0: { opacity: 0 }, 100: { opacity: 1 } },
    callback = null,
    scrollTrigger = {
      active: false,
      timeline: 'view',
      timelineParams: 'block',
    },
    onUpdate = null, // Callback for animation progress updates
  } = options;

  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  const keyframesName = `anim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const keyframesStr = Object.entries(keyframes)
    .map(([percentage, props]) => {
      const properties = Object.entries(props)
        .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
        .join(' ');

      const keyframePercentage = (percentage === 'from' ? '0%' :
        percentage === 'to' ? '100%' : `${percentage}%`);

      return `${keyframePercentage} { 
        ${properties} 
      }`;
    })
    .join(' ');

  // Append keyframes and scroll-timeline to the shared style element
  const css = `
    /** --- ${typeof element === 'string' ? element : ''} --- **/

    @keyframes ${keyframesName} { 
      ${keyframesStr} 
    }
    @scroll-timeline ${keyframesName} {
      scroll-timeline-name: ${keyframesName};
    }
  `;
  styleManager.appendCSS(css);

  const existingAnimation = el.style.animation;
  const newAnimation = `
    ${keyframesName} ${duration}ms ${easing} ${delay}ms ${iterations} ${direction} backwards
  `;
  el.style.animation = existingAnimation ? `${existingAnimation}, ${newAnimation}` : newAnimation;

  if (scrollTrigger.active) {
    const {
      markers = scrollTrigger.markers || false,
      timeline = 'view',
      timelineParams = 'block',
    } = scrollTrigger;

    el.style.animationTimeline = `${scrollTrigger.timeline}(${scrollTrigger.timelineParams})`;
    el.style.scrollTimelineName = keyframesName;

    if (markers) {
      addScrollMarkers(el, () => computeScrollPositions(el, start, end));
    }
  } else {
    el.style.animationPlayState = 'running';
  }

  // Handle animation events for updates
  if (onUpdate) {
    const updateCallback = (event) => {
      onUpdate(event, {
        currentTime: event.elapsedTime,
        animationName: event.animationName,
        playState: el.style.animationPlayState,
      });
    };

    el.addEventListener('animationiteration', updateCallback);
    el.addEventListener('animationend', updateCallback);
  }

  if (callback) {
    el.addEventListener('animationend', callback);
  }

  const cleanup = () => {
    el.removeEventListener('animationiteration', onUpdate);
    el.removeEventListener('animationend', onUpdate);
    el.style.animation = existingAnimation; // Restore previous animations
    styleManager.removeKeyframes(keyframesName);
  };

  return {
    element: el,
    start: () => (el.style.animationPlayState = 'running'),
    pause: () => (el.style.animationPlayState = 'paused'),
    reset: () => {
      el.style.animationPlayState = 'paused';
      el.style.animationDelay = '0ms';
    },
    cleanup,
  };
}
