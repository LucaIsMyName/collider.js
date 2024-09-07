export const observe = {
  viewport: function (el, options = {}) {
    if (!(el instanceof HTMLElement)) {
      el = document.querySelector(el);
    }

    if (!el) {
      console.error('Element not found.');
      return;
    }

    const {
      start = 'top center',
      end = 'bottom center',
      onEnter = () => { },
      onLeave = () => { },
      onProgress = () => { },
    } = options;

    let hasEntered = false;

    // Helper function to calculate positions and check viewport status
    const checkViewport = () => {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      const startPosition = typeof start === 'function' ? start() : calculatePosition(start, rect, scrollTop, viewportHeight);
      const endPosition = typeof end === 'function' ? end() : calculatePosition(end, rect, scrollTop, viewportHeight);

      const currentScroll = scrollTop + viewportHeight;
      const inViewport = currentScroll >= startPosition && scrollTop <= endPosition;

      // Check if element is entering or leaving the viewport
      if (inViewport && !hasEntered) {
        onEnter();
        hasEntered = true;
      } else if (!inViewport && hasEntered) {
        onLeave();
        hasEntered = false;
      }

      // Progress callback
      const progress = Math.min(Math.max((scrollTop - startPosition) / (endPosition - startPosition), 0), 1);
      onProgress(progress);
    };

    // Add scroll event listener to trigger viewport checks on scroll
    window.addEventListener('scroll', checkViewport);

    // Initial check on load
    checkViewport();

    return {
      destroy() {
        window.removeEventListener('scroll', checkViewport);
      },
    };
  },

  scroll: function (options = {}) {
    const {
      throttle = 100,
      onEnter = () => { },
      onLeave = () => { },
      onProgress = () => { }
    } = options;

    let isScrolling = false; // Flag to track if scrolling is happening
    let scrollTimeout; // Timeout ID to handle scroll end detection

    // Throttle the scroll event to reduce the number of calls
    let lastExecution = 0;
    let hasEntered = false; // Flag to track if onEnter has been called

    // Function to handle the scroll event
    const handleScroll = () => {
      const currentTime = Date.now();
      if (currentTime - lastExecution >= throttle) {
        lastExecution = currentTime;

        if (!isScrolling) {
          onEnter(); // Trigger onEnter when scrolling starts
          hasEntered = true;
        }

        // Continuously trigger onProgress while scrolling
        onProgress();

        isScrolling = true;

        // Clear any previous timeout
        if (scrollTimeout) clearTimeout(scrollTimeout);

        // Set a timeout to detect when scrolling has stopped
        scrollTimeout = setTimeout(() => {
          if (isScrolling) {
            onLeave(); // Trigger onLeave when scrolling has stopped
            isScrolling = false;
          }
        }, throttle);
      }
    };

    // Add the throttled scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Optionally remove the scroll listener if necessary
    return {
      destroy() {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      }
    };
  }
}

// Ensure calculatePosition handles all formats correctly
function calculatePosition(position, rect, scrollTop, viewportHeight) {
  if (typeof position === 'string') {
    const [pos, align] = position.split(' ');
    switch (pos) {
      case 'top':
        return rect.top + scrollTop - (align === 'center' ? viewportHeight / 2 : 0);
      case 'bottom':
        return rect.bottom + scrollTop - (align === 'center' ? viewportHeight / 2 : 0);
      default:
        console.error(`Unknown position: ${pos}`);
        return scrollTop;
    }
  } else if (typeof position === 'number') {
    return position + scrollTop;
  } else {
    console.error(`Unknown position format: ${position}`);
    return scrollTop;
  }
}