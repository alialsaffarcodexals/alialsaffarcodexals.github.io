import { paths } from '../../config/paths.js';

function getToken() {
  return localStorage.getItem('jwt');
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = paths.login();
    return null;
  }
  return token;
}

export function logout() {
  localStorage.removeItem('jwt');
  window.location.href = paths.login();
}
