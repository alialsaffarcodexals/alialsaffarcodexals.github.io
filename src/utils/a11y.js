// Small helpers for SVG accessibility.

// addAriaToSvg: adds basic screen-reader metadata to chart SVG elements.
export function addAriaToSvg(svgElement, title, description) {
  if (!svgElement) return;
  svgElement.setAttribute('role', 'img');
  svgElement.setAttribute('aria-label', title || 'Chart');

  if (description) {
    const descElement = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
    descElement.textContent = description;
    svgElement.insertBefore(descElement, svgElement.firstChild);
  }
}
