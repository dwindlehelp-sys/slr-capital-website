document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const partnersList = document.getElementById('partnersList');
    const addPartnerForm = document.getElementById('addPartnerForm');
    const searchInput = document.getElementById('searchInput');

    const fetchAndDisplayPartners = async (searchTerm = '') => {
        try {
            // Add the search term as a query parameter to the URL
            const url = `http://localhost:8000/api/partners?search=${searchTerm}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const partners = await response.json();
            partnersList.innerHTML = '';

            if (partners.length === 0) {
                partnersList.innerHTML = '<li>No partners found.</li>';
                return;
            }

            partners.forEach(partner => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${partner.bankName}</span>`;
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i> Delete`;
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete ${partner.bankName}?`)) {
                        await fetch(`http://localhost:8000/api/partners/${partner.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        fetchAndDisplayPartners(searchInput.value); // Re-fetch with current search
                    }
                });
                li.appendChild(deleteButton);
                partnersList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching partners:', error);
            partnersList.innerHTML = '<li>Error loading partners.</li>';
        }
    };

    // Handle the "Add Partner" form submission
    addPartnerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bankName = document.getElementById('bankName').value;
        const logoUrl = document.getElementById('logoUrl').value;
        const response = await fetch('http://localhost:8000/api/partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bankName, logoUrl }),
        });
        if (response.ok) {
            addPartnerForm.reset();
            fetchAndDisplayPartners(); // Refresh the list
        } else {
            alert('Failed to add partner.');
        }
    });

    // Handle search input
    searchInput.addEventListener('input', () => {
        fetchAndDisplayPartners(searchInput.value);
    });

    // Initial load
    fetchAndDisplayPartners();
});