/**
 * auth.service.js
 * Auth API helpers for signing in and saving/retrieving the session token.
 */
import { SIGNIN_URL } from '../reboot01/endpoints.js';

/**
 * Login using Basic Auth.
 * User can type username or email.
 * We return JWT from the response.
 */
export async function signinBasic(identifier, password) {
  let creds;
  try {
    // btoa supports Latin1 only, so this throws on some unicode input.
    creds = btoa(`${identifier}:${password}`);
  } catch {
    throw new Error('Please use English letters/numbers only for username/email and password (Arabic/unicode characters are not supported).');
  }

  const res = await fetch(SIGNIN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}` },
  });

  if (!res.ok) {
    throw new Error('Invalid credentials. Please try again.');
  }

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data.token || data;
  } catch {
    return text.trim();
  }
}
