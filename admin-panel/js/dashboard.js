document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    

    // --- Sidebar and Menu Logic ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const sidebarCloseButton = document.getElementById('sidebar-close-button');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const openSidebar = () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', openSidebar);
        sidebarCloseButton.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }

    // --- Core Dashboard Logic ---
    const logoutButton = document.getElementById('logoutButton');
    const statsForm = document.getElementById('statsForm');
    const loanAmountInput = document.getElementById('loanAmount');

    // Function to fetch and display the current stats
    const fetchAndDisplayStats = async () => {
        try {
            const response = await fetch('https://slrproject.netlify.app/api/homepage-stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const stats = await response.json();
            loanAmountInput.value = stats.loanDisbursed;
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    // Event listener to handle the form submission for updating stats
    statsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newAmount = loanAmountInput.value;
        try {
            const response = await fetch('https://slrproject.netlify.app/api/homepage-stats', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ loanDisbursed: newAmount }),
            });

            if (response.ok) {
                alert('Stats updated successfully!');
            } else {
                alert('Error: Failed to update stats. Check the backend terminal for details.');
            }
        } catch (error) {
            alert('A network error occurred. Is the server running?');
        }
    });

    // Event listener for the logout button
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Initial data load when the page opens
    fetchAndDisplayStats();
});