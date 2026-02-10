import { signinBasic } from '../services/auth/auth.service.js';
import Toast from '../components/toast/toast.js';
import { paths } from '../config/paths.js';

/**
 * Initializes login page behavior:
 * field validation, password visibility toggle, authentication, and redirect.
 */
export function initLoginPage() {
  const form = document.getElementById('loginForm');
  const identifierInput = document.getElementById('identifier');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('loginSubmit');
  const identifierValidation = document.getElementById('identifier-validation');
  const passwordValidation = document.getElementById('password-validation');

  if (!form) return;

  togglePasswordBtn?.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  identifierInput?.addEventListener('input', () => validateField(identifierInput, identifierValidation, 'identifier'));
  passwordInput?.addEventListener('input', () => validateField(passwordInput, passwordValidation, 'password'));

  /**
   * Validates one field based on minimal rules and updates its UI state.
   */
  function validateField(input, validationSpan, fieldType) {
    const value = input.value.trim();
    if (fieldType === 'identifier') {
      updateFieldState(input, validationSpan, value.length >= 3, 'Min 3 characters');
    }
    if (fieldType === 'password') {
      updateFieldState(input, validationSpan, value.length >= 6, 'Min 6 characters');
    }
  }

  /**
   * Applies valid/invalid classes and indicator symbol for a field.
   */
  function updateFieldState(input, validationSpan, isValid, invalidMessage = '') {
    const wrapper = input?.closest('.input-wrapper');

    if (input.value.trim() === '') {
      input.classList.remove('valid', 'invalid');
      validationSpan.classList.remove('valid', 'invalid');
      validationSpan.textContent = '';
      wrapper?.classList.remove('has-error');
      return;
    }

    if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      validationSpan.classList.remove('valid', 'invalid');
      validationSpan.textContent = '';
      wrapper?.classList.remove('has-error');
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      validationSpan.classList.remove('valid');
      validationSpan.classList.add('invalid');
      validationSpan.textContent = invalidMessage || 'Invalid';
      wrapper?.classList.add('has-error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    const isIdentifierValid = identifier.length >= 3;
    const isPasswordValid = password.length >= 6;

    if (!isIdentifierValid || !isPasswordValid) {
      if (!isIdentifierValid) updateFieldState(identifierInput, identifierValidation, false, 'Min 3 characters');
      if (!isPasswordValid) updateFieldState(passwordInput, passwordValidation, false, 'Min 6 characters');
      return;
    }

    submitBtn?.classList.add('loading');
    if (submitBtn) submitBtn.disabled = true;

    // UI is handled purely by CSS via .loading class

    try {
      const token = await signinBasic(identifier, password);
      localStorage.setItem('jwt', token);
      new Toast().success('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = paths.profile();
      }, 600);
    } catch (err) {
      new Toast().error(err.message || 'Login failed');
      if (submitBtn) submitBtn.disabled = false;
      submitBtn?.classList.remove('loading');

      // UI is handled purely by CSS via .loading class
    }
  });
}
