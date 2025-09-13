document.addEventListener('DOMContentLoaded', () => {
    const leadForm = document.getElementById('leadForm');
    const formMessage = document.getElementById('formMessage');

    // Check if the form actually exists on the page before adding a listener
    if (leadForm) {
        leadForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get form elements by their ID within the form
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const serviceRequested = document.getElementById('service').value;

            const formData = {
                name,
                phone,
                email,
                serviceRequested
            };

            try {
                const response = await fetch('https://slrproject.netlify.app/api/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    formMessage.textContent = 'Thank you! Your inquiry has been submitted successfully.';
                    formMessage.style.color = 'green';
                    leadForm.reset();
                } else {
                    formMessage.textContent = data.error || 'Failed to submit inquiry. Please try again.';
                    formMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formMessage.textContent = 'An error occurred. Please check your connection and try again.';
                formMessage.style.color = 'red';
            }
        });
    }
});