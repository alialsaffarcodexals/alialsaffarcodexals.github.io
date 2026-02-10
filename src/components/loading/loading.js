class LoadingOverlay {
  constructor(message = 'Loading...') {
    this.message = message;
    this.el = null;
    this.messageEl = null;
    this.visible = false;
  }

  ensure() {
    if (this.el) return;

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
      <div class="loading-overlay-card">
        <div class="loading-spinner" aria-hidden="true"></div>
        <p class="loading-message"></p>
      </div>
    `;

    document.body.appendChild(overlay);
    this.el = overlay;
    this.messageEl = overlay.querySelector('.loading-message');
    this.setMessage(this.message);
  }

  setMessage(message) {
    this.message = message || 'Loading...';
    this.ensure();
    if (this.messageEl) this.messageEl.textContent = this.message;
  }

  show(message) {
    if (message) this.setMessage(message);
    else this.ensure();

    if (!this.el) return;
    this.visible = true;
    this.el.classList.add('show');
    this.el.setAttribute('aria-hidden', 'false');
  }

  hide() {
    if (!this.el) return;
    this.visible = false;
    this.el.classList.remove('show');
    this.el.setAttribute('aria-hidden', 'true');
  }
}

let singleton = null;

export function getGlobalLoader(message = 'Loading...') {
  if (!singleton) singleton = new LoadingOverlay(message);
  if (message) singleton.setMessage(message);
  return singleton;
}

