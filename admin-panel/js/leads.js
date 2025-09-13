document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const leadsTableBody = document.getElementById('leads-table-body');
    const logoutButton = document.getElementById('logoutButton'); // Assuming logout button is on the page
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterButton = document.getElementById('filterButton');
    const resetButton = document.getElementById('resetButton');
    const exportButton = document.getElementById('exportButton');
    const deleteAllButton = document.getElementById('deleteAllButton');

    const fetchAndDisplayLeads = async () => {
        let url = 'https://slrproject.netlify.app/api/leads';
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const leads = await response.json();
            leadsTableBody.innerHTML = '';

            if (leads.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" style="text-align: center;">No leads found.</td>`;
                leadsTableBody.appendChild(row);
                return;
            }

            leads.forEach(lead => {
                const row = document.createElement('tr');
                const submittedDate = new Date(lead.submittedAt).toLocaleString('en-IN');
                
                // This corrected version includes the 6th column for the delete button
                row.innerHTML = `
                    <td>${submittedDate}</td>
                    <td>${lead.name}</td>
                    <td>${lead.phone}</td>
                    <td>${lead.email}</td>
                    <td>${lead.serviceRequested}</td>
                    <td><button class="delete-btn" data-id="${lead.id}">Delete</button></td>
                `;
                leadsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to fetch or display leads:', error);
        }
    };

    // Event Delegation for delete buttons
    leadsTableBody.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const leadId = e.target.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete lead #${leadId}?`)) {
                await fetch(`https://slrproject.netlify.app/api/leads/${leadId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchAndDisplayLeads();
            }
        }
    });

    filterButton.addEventListener('click', fetchAndDisplayLeads);
    resetButton.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAndDisplayLeads();
    });
    deleteAllButton.addEventListener('click', async () => {
        if (confirm('ARE YOU SURE you want to delete ALL leads? This cannot be undone.')) {
            await fetch('https://slrproject.netlify.app/api/leads', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAndDisplayLeads();
        }
    });
    // Replace the old exportButton listener with this one
exportButton.addEventListener('click', async () => {
    try {
        const response = await fetch('https://slrproject.netlify.app/api/leads/export', {
            headers: {
                // This is the crucial part: sending the token
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Create a blob from the CSV data
        const blob = await response.blob();
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link to trigger the download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'leads.csv'; // The filename for the download
        document.body.appendChild(a);
        
        a.click(); // Programmatically click the link to start the download
        
        // Clean up
        window.URL.revokeObjectURL(url);
        a.remove();
        
    } catch (error) {
        console.error('Error exporting leads:', error);
        alert('Failed to export leads.');
    }
});
    
    // Check for logout button before adding listener
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    fetchAndDisplayLeads();
});