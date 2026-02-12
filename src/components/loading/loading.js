/**
 * loading.js
 * Reusable global loading overlay component with singleton access helper.
 */
class LoadingOverlay {
  // constructor: stores default state for the global overlay instance.
  constructor(message = 'Loading...') {
    this.message = message;
    this.el = null;
    this.messageEl = null;
    this.visible = false;
  }

  // ensure: creates overlay DOM once and reuses it for later calls.
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

  // setMessage: updates the message text shown inside the overlay.
  setMessage(message) {
    this.message = message || 'Loading...';
    this.ensure();
    if (this.messageEl) this.messageEl.textContent = this.message;
  }

  // show: displays the overlay and optionally updates its message.
  show(message) {
    if (message) this.setMessage(message);
    else this.ensure();

    if (!this.el) return;
    this.visible = true;
    this.el.classList.add('show');
    this.el.setAttribute('aria-hidden', 'false');
  }

  // hide: hides the overlay without removing it from the DOM.
  hide() {
    if (!this.el) return;
    this.visible = false;
    this.el.classList.remove('show');
    this.el.setAttribute('aria-hidden', 'true');
  }
}

let singleton = null;

// getGlobalLoader: Returns the singleton loading overlay instance and updates its message when provided.
export function getGlobalLoader(message = 'Loading...') {
  if (!singleton) singleton = new LoadingOverlay(message);
  if (message) singleton.setMessage(message);
  return singleton;
}
