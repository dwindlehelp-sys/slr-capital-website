document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordMessage = document.getElementById('passwordMessage');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            passwordMessage.textContent = '';

            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                passwordMessage.textContent = "New passwords do not match.";
                passwordMessage.style.color = 'red';
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/admin/change-password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ oldPassword, newPassword }),
                });
                const data = await response.json();
                if (response.ok) {
                    passwordMessage.textContent = data.message;
                    passwordMessage.style.color = 'green';
                    changePasswordForm.reset();
                } else {
                    passwordMessage.textContent = data.error;
                    passwordMessage.style.color = 'red';
                }
            } catch (error) {
                passwordMessage.textContent = 'An error occurred. Please try again.';
                passwordMessage.style.color = 'red';
            }
        });
    }

    // Sidebar logic for mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebarCloseButton = document.getElementById('sidebar-close-button');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if(mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
        sidebarCloseButton.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});