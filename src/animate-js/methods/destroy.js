/**
 * Destroy the Animation
 * @description Remove the animation keyframes and scroll-timelines from the document
 * @param {string} selector - The selector for the element to destroy the animation from.
 * @returns {void}
 * @example
 * animate.destroy('button');
 */
export function destroy(selector) {
  // Get the elements to destroy animations from
  const elements = document.querySelectorAll(selector);

  // Collect all animation names from elements
  const animationNames = new Set();
  elements.forEach(el => {
    // Extract multiple animation names, if present
    const animationNamesList = el.style.animationName.split(',').map(name => name.trim());
    animationNamesList.forEach(name => {
      if (name) animationNames.add(name);
    });

    // Clear inline animation styles
    el.style.animationName = '';
    el.style.animationFillMode = '';
    el.style.animationTimingFunction = '';
    el.style.animationDuration = '';
    el.style.animationIterationCount = '';
    el.style.animationDirection = '';
    el.style.animationDelay = '';
    el.style.animationPlayState = '';
  });

  // Remove the keyframes and scroll-timelines rules from the style element
  const styleElement = document.getElementById('animate-js-keyframes');
  if (styleElement) {
    const styleSheet = styleElement.sheet;
    if (styleSheet) {
      const rules = Array.from(styleSheet.cssRules);

      // Collect indices of rules to delete
      const indicesToDelete = [];
      rules.forEach((rule, index) => {
        if (rule.type === CSSRule.KEYFRAMES_RULE && animationNames.has(rule.name)) {
          console.log(`Marking keyframes rule for deletion: ${rule.name}`);
          indicesToDelete.push(index);
        }
        // Note: CSSRule.SCROLL_TIMELINE_RULE may not be supported everywhere
        else if (rule.type === CSSRule.SCROLL_TIMELINE_RULE && animationNames.has(rule.name)) {
          console.log(`Marking scroll-timeline rule for deletion: ${rule.name}`);
          indicesToDelete.push(index);
        }
      });

      // Delete the collected rules in reverse order
      indicesToDelete.reverse().forEach(index => {
        styleSheet.deleteRule(index);
      });
    }
  }
}
