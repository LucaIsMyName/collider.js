export function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function kebabToCamel(str) {
  return str.replace(/-./g, (match) => match.charAt(1).toUpperCase());
}

export function sanitizeHtml() {
  this.innerHTML = this.innerHTML
    .replace(/<script.*?>.*?<\/script>/g, '')
    .replace(/<style.*?>.*?<\/style>/g, '')
    .replace(/<link.*?>/g, '')
    .replace(/<iframe.*?>.*?<\/iframe>/g, '')
    .replace(/<object.*?>.*?<\/object>/g, '')
    .replace(/<embed.*?>.*?<\/embed>/g, '')
    .replace(/<applet.*?>.*?<\/applet>/g, '')
    .replace(/<frame.*?>.*?<\/frame>/g, '')
    .replace(/<frameset.*?>.*?<\/frameset>/g, '')
    .replace(/<meta.*?>/g, '')
}

export function calculatePosition(position, rect, scrollTop, viewportHeight) {
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
}

/**
 * 
 * @param {string} chars 
 * @returns {string} char
 */
export function getRandomChar(chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') {
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

/**
 * 
 * @param {string} css 
 * @returns {void}
 */
export function insertCssInHead(id = '', css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  style.setAttribute('id', id);
}