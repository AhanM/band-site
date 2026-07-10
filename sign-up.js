(function () {
    const form = document.getElementById('signup-form');
    const feedbackEl = document.getElementById('signup-feedback');
    const submitBtn = form?.querySelector('.signup-form__submit');
    const emailInput = form?.querySelector('#email');
    const consentInput = form?.querySelector('#email-consent');
    const sheetUrl = window.GOOGLE_SHEET_URL || '';

    if (!form) return;

    emailInput?.addEventListener('input', function () {
        clearFieldError('email-error', emailInput);
    });

    consentInput?.addEventListener('change', function () {
        clearFieldError('consent-error', consentInput);
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideFeedback();
        clearAllFieldErrors();

        if (!validateForm()) {
            return;
        }

        if (!sheetUrl) {
            showFeedback('Sign-up is not connected yet. Add your Google Sheet URL in config.js.', 'error');
            return;
        }

        const data = new FormData(form);
        const payload = {
            full_name: String(data.get('full_name') || '').trim(),
            email: String(data.get('email') || '').trim(),
            phone: String(data.get('phone') || '').trim(),
            country: String(data.get('country') || '').trim(),
            email_consent: data.get('email_consent') ? 'yes' : 'no',
            list: 'daisys-room',
        };

        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(sheetUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Submit failed');
            }

            window.location.href = '/signup/success';
        } catch (err) {
            console.error(err);
            showFeedback('Something went wrong. Please try again.', 'error');
            if (submitBtn) submitBtn.disabled = false;
        }
    });

    function validateForm() {
        let valid = true;

        if (emailInput) {
            const email = emailInput.value.trim();
            emailInput.value = email;

            if (!email) {
                showFieldError('email-error', emailInput, 'Please enter your email.');
                valid = false;
            } else if (!emailInput.checkValidity()) {
                showFieldError('email-error', emailInput, 'Please enter a valid email address.');
                valid = false;
            }
        }

        if (consentInput && !consentInput.checked) {
            showFieldError('consent-error', consentInput, 'Please agree to be contacted by email.');
            valid = false;
        }

        return valid;
    }

    function showFieldError(errorId, input, message) {
        const errorEl = document.getElementById(errorId);
        if (!errorEl) return;

        errorEl.hidden = false;
        errorEl.textContent = message;
        input.setAttribute('aria-invalid', 'true');
        input.classList.add('signup-form__input--invalid');
    }

    function clearFieldError(errorId, input) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.hidden = true;
            errorEl.textContent = '';
        }
        input.removeAttribute('aria-invalid');
        input.classList.remove('signup-form__input--invalid');
    }

    function clearAllFieldErrors() {
        if (emailInput) clearFieldError('email-error', emailInput);
        if (consentInput) clearFieldError('consent-error', consentInput);
    }

    function showFeedback(message, type) {
        if (!feedbackEl) return;
        feedbackEl.hidden = false;
        feedbackEl.textContent = message;
        feedbackEl.className = 'signup-feedback signup-feedback--' + type;
    }

    function hideFeedback() {
        if (!feedbackEl) return;
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
    }
})();
