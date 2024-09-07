
/**
 * Computes the scroll start and end positions based on the given element and trigger positions.
 *
 * @param {HTMLElement} el - The element for which to calculate scroll positions.
 * @param {string|function} start - The start trigger position.
 * @param {string|function} end - The end trigger position.
 * @returns {Object} - The computed start and end positions.
 */
export const computeScrollPositions = (el, start, end) => {
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  const startPosition = typeof start === 'function' ? start() : calculatePosition(start, rect, scrollTop, viewportHeight);
  const endPosition = typeof end === 'function' ? end() : calculatePosition(end, rect, scrollTop, viewportHeight);

  return { startPosition, endPosition };
};

/**
 * Calculates the scroll position based on the given string position (e.g., 'top center').
 *
 * @param {string|number} position - The position string or number.
 * @param {DOMRect} rect - The bounding client rect of the element.
 * @param {number} scrollTop - The current scroll position from the top.
 * @param {number} viewportHeight - The height of the viewport.
 * @returns {number} - The calculated scroll position.
 */
export const calculatePosition = (position, rect, scrollTop, viewportHeight) => {
  if (typeof position === 'number') {
    return position;
  } else if (typeof position === 'string') {
    const [elementEdge, viewportEdge] = position.split(' ');
    let pos = 0;

    switch (elementEdge) {
      case 'top':
        pos = rect.top + scrollTop;
        break;
      case 'center':
        pos = rect.top + scrollTop + rect.height / 2;
        break;
      case 'bottom':
        pos = rect.top + scrollTop + rect.height;
        break;
      default:
        pos = rect.top + scrollTop;
    }

    switch (viewportEdge) {
      case 'top':
        pos -= 0;
        break;
      case 'center':
        pos -= viewportHeight / 2;
        break;
      case 'bottom':
        pos -= viewportHeight;
        break;
    }
    return pos;
  } else {
    return scrollTop;
  }
};

/**
 * 
 * @param {HTMLElement} el 
 * @param {Function} computePositions 
 */
export function addScrollMarkers(el, computePositions) {
  const { startPosition, endPosition } = computePositions();
  const markerStart = document.createElement('div');
  const markerEnd = document.createElement('div');

  markerStart.style.position = 'absolute';
  markerStart.style.top = `${startPosition}px`;
  markerStart.style.left = '0';
  markerStart.style.width = '100%';
  markerStart.style.height = '2px';
  markerStart.style.backgroundColor = 'red';
  markerStart.style.zIndex = '9999';
  markerStart.style.pointerEvents = 'none';
  markerStart.innerText = 'Start';

  markerEnd.style.position = 'absolute';
  markerEnd.style.top = `${endPosition}px`;
  markerEnd.style.left = '0';
  markerEnd.style.width = '100%';
  markerEnd.style.height = '2px';
  markerEnd.style.backgroundColor = 'green';
  markerEnd.style.zIndex = '9999';
  markerEnd.style.pointerEvents = 'none';
  markerEnd.innerText = 'End';

  document.body.appendChild(markerStart);
  document.body.appendChild(markerEnd);
}

