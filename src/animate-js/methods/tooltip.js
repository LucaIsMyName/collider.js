import tippy from 'https://esm.sh/tippy.js@6';
import { insertCssInHead } from './utils.js';

/**
 * Initializes a tooltip for the specified element with given options.
 *
 * @param {HTMLElement} element - The HTML element to attach the tooltip to.
 * @param {Object} [options={}] - Configuration options for the tooltip.
 * @param {string} [options.maxWidth='none'] - Maximum width of the tooltip.
 * @param {string} [options.content='Tooltip'] - Content of the tooltip.
 * @param {string} [options.trigger='mouseenter'] - Trigger event for the tooltip.
 * @param {string} [options.placement='top'] - Placement of the tooltip.
 * @param {string} [options.theme='light'] - Theme of the tooltip.
 * @param {boolean} [options.interactive=false] - Whether the tooltip should be interactive.
 * @param {boolean} [options.followCursor=false] - Whether the tooltip should follow the cursor.
 * @param {boolean} [options.inertia=false] - Whether the tooltip should have inertia.
 * @param {boolean} [options.allowHtml=false] - Whether HTML content is allowed in the tooltip.
 * @param {number} [options.interactiveBorder=2] - Border width for interactive tooltips.
 * @param {boolean} [options.interactive=true] - Whether the tooltip is interactive.
 * @param {string} [options.appendTo='body'] - Where to append the tooltip.
 * @param {number[]} [options.offset=[0, 0]] - Offset of the tooltip.
 * @param {boolean} [options.hasArrow=true] - Whether the tooltip has an arrow.
 * @param {string} [options.arrow='<svg ...'] - SVG content for the arrow.
 */
export function tooltip(
  element,
  options = {
    maxWidth: 'none',
    content: 'Tooltip',
    trigger: 'mouseenter',
    placement: 'top',
    theme: 'light',
    interactive: false,
    followCursor: false,
    inertia: false,
    allowHtml: true,
    interactiveBorder: 2,
    interactive: true,
    appendTo: 'body',
    offset: [0, 0],
    hasArrow: true,
    arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`,
  }
) {
  // Ensure the element is valid
  if (!(element instanceof HTMLElement)) {
    console.error('Invalid element provided for tooltip.');
    return;
  }



  // append a style tag to the head and insert a tippy reset (check if there is already trhis reset the return early)
  if (!document.querySelector('style#tippy-reset')) {
    insertCssInHead('tippy-reset', `
      .tippy-content, .tippy-box {
        background: transparent;
        background-color: transparent;
        color: currentColor;
        padding: 0;
        margin:0;
      }
    `)
  }


  // Initialize Tippy with the provided options
  tippy(element, {
    content: options.content,
    trigger: options.trigger,
    placement: options.placement,
    theme: options.theme,
    interactive: options.interactive,
    followCursor: options.followCursor,
    inertia: options.inertia,
    allowHtml: options.allowHtml || true,
    interactiveBorder: options.interactiveBorder,
    appendTo: options.appendTo,
    offset: options.offset,
    arrow: options.hasArrow ? options.arrow : false,
    maxWidth: options.maxWidth
  });

  // Return the Tippy instance
  return tippy;
}
