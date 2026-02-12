// Small toast helper used for success/error messages.

export default class Toast {
  // constructor: prepares the container so toasts can be inserted immediately.
  constructor() {
    this.container = null;
    this.initContainer();
  }

  // initContainer: finds/creates the single toast container element.
  initContainer() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  // show: creates a toast element and auto-hides it after the timeout.
  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    this.container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    // hideToast: Removes the toast with a short exit animation and cleans up empty container state.
    const hideToast = () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
        if (this.container && this.container.children.length === 0) {
          this.container.remove();
          this.container = null;
          this.initContainer();
        }
      }, 300);
    };

    toast.querySelector('.toast-close')?.addEventListener('click', hideToast);
    setTimeout(hideToast, duration);
  }

  // success: shorthand helper for success-style notifications.
  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  // error: shorthand helper for error-style notifications.
  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }
}

// Expose globally for quick debugging.
window.Toast = Toast;
