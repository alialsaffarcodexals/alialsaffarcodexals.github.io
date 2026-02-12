// Run function only after user stops typing/changing for a moment.
// debounce: returns a wrapped function that delays the original call.
export function debounce(func, wait = 200) {
  let timeout;
  // executed: clears prior timer and schedules the latest call.
  return function executed(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
