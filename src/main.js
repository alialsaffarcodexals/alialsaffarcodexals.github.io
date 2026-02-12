/**
 * main.js
 * App entry point that chooses login or dashboard initialization based on page DOM.
 */
import { initLoginPage } from './pages/login.js';
import { initDashboardPages } from './pages/dashboard.js';

/**
 * App entry file.
 *
 * No router here.
 * If login form is on page, run login logic.
 * Otherwise run dashboard logic.
 */
if (document.getElementById('loginForm')) {
  initLoginPage();
} else {
  initDashboardPages();
}
