(function () {
    const form = document.getElementById('signup-form');
    const feedbackEl = document.getElementById('signup-feedback');
    const submitBtn = form?.querySelector('.signup-form__submit');
    const sheetUrl = window.GOOGLE_SHEET_URL || '';

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideFeedback();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!sheetUrl) {
            showFeedback('Sign-up is not connected yet. Add your Google Sheet URL in config.js.', 'error');
            return;
        }

        const data = new FormData(form);
        const payload = {
            full_name: String(data.get('full_name') || ''),
            email: String(data.get('email') || ''),
            phone: String(data.get('phone') || ''),
            country: String(data.get('country') || ''),
            email_consent: data.get('email_consent') ? 'yes' : 'no',
            list: "daisys-room",
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
