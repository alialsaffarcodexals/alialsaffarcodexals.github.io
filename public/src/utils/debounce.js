// Debounce: limit how often a function runs
export function debounce(func, wait = 200) {
  let timeout;
  return function executed(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
