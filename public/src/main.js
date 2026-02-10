import { initLoginPage } from './pages/login.js';
import { initDashboardPages } from './pages/dashboard.js';

/**
 * Frontend entry.
 *
 * No router/build step: we choose the initializer based on which page DOM exists.
 * - Login page → #loginForm
 * - Authenticated pages → dashboard init (loads data + renders only what exists on that page)
 */
if (document.getElementById('loginForm')) {
  initLoginPage();
} else {
  initDashboardPages();
}
