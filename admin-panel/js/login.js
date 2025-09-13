const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    // Prevent the form from actually submitting and reloading the page
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://slrproject.netlify.app/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Login was successful
            errorMessage.textContent = '';
            
            // 🔑 Store the token in the browser's local storage
            localStorage.setItem('token', data.token);
            
            // Redirect to the dashboard page
            window.location.href = 'dashboard.html';
        } else {
            // Login failed, show error message from the server
            errorMessage.textContent = data.error || 'Login failed.';
        }
    } catch (error) {
        // Network error or other issue
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});