import { SIGNIN_URL } from '../reboot01/endpoints.js';

/**
 * Sign in to Reboot01 using HTTP Basic Auth.
 *
 * The API accepts:
 * - username:password OR email:password
 *
 * Returns a JWT token string (or token field depending on server response).
 */
export async function signinBasic(identifier, password) {
  let creds;
  try {
    // btoa only supports Latin1; show a friendly error if user enters Arabic/unicode characters.
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
