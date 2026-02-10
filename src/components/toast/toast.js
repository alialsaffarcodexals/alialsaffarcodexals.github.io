// Reusable toast notification utility

export default class Toast {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

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

  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }
}

// Optional: keep a global for older code / debugging
window.Toast = Toast;
