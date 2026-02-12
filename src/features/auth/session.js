/**
 * session.js
 * Session helpers for reading token, guarding routes, and logout redirection.
 */
import { paths } from '../../config/paths.js';

// getToken: Reads the auth token from localStorage.
function getToken() {
  return localStorage.getItem('jwt');
}

// requireAuth: Ensures a token exists; if not, redirects to login and returns null.
export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = paths.login();
    return null;
  }
  return token;
}

// logout: Clears session token and sends the user back to the login page.
export function logout() {
  localStorage.removeItem('jwt');
  window.location.href = paths.login();
}
