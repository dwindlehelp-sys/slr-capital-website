document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // --- DOM Elements ---
    const applicationsTableBody = document.getElementById('applications-table-body');
    const roleFilter = document.getElementById('roleFilter');
    const searchInput = document.getElementById('searchInput');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterButton = document.getElementById('filterButton');
    const resetButton = document.getElementById('resetButton');
    const exportButton = document.getElementById('exportButton');
    const deleteAllButton = document.getElementById('deleteAllButton');
    
    // --- Populate the role filter dropdown ---
    const populateRoleFilter = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/job-titles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const jobs = await response.json();
            jobs.forEach(job => {
                const option = document.createElement('option');
                option.value = job.id;
                option.textContent = job.roleTitle;
                roleFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to populate roles:', error);
        }
    };

    // --- Fetch and display applications based on all filters ---
    const fetchAndDisplayApplications = async () => {
        const searchTerm = searchInput.value;
        const jobId = roleFilter.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        const url = `http://localhost:8000/api/applications?search=${searchTerm}&jobId=${jobId}&startDate=${startDate}&endDate=${endDate}`;
        
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const applications = await response.json();
            applicationsTableBody.innerHTML = '';

            if (applications.length === 0) {
                applicationsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No applications found matching your criteria.</td></tr>`;
                return;
            }

            applications.forEach(app => {
                const row = document.createElement('tr');
                const appliedDate = new Date(app.appliedAt).toLocaleString('en-IN');
                const resumeLink = `<a href="http://localhost:8000/${app.resumeUrl.replace(/\\/g, '/')}" target="_blank">View Resume</a>`;

                row.innerHTML = `
                    <td>${appliedDate}</td>
                    <td>${app.job.roleTitle}</td>
                    <td>${app.applicantName}</td>
                    <td>${app.applicantEmail}</td>
                    <td>${app.applicantPhone}</td>
                    <td>${resumeLink}</td>
                    <td><button class="delete-btn" data-id="${app.id}">Delete</button></td>
                `;
                applicationsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        }
    };
    
    // --- EVENT LISTENERS ---
    filterButton.addEventListener('click', fetchAndDisplayApplications);
    resetButton.addEventListener('click', () => {
        roleFilter.value = '';
        searchInput.value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAndDisplayApplications();
    });

    deleteAllButton.addEventListener('click', async () => {
        if (confirm('ARE YOU SURE you want to delete ALL applications? This is irreversible.')) {
            await fetch('http://localhost:8000/api/applications', {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAndDisplayApplications();
        }
    });

    exportButton.addEventListener('click', async () => {
        try {
            // Corrected to fetch from the applications export endpoint
            const response = await fetch('http://localhost:8000/api/applications/export', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'applications.csv'; // Corrected filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error exporting applications:', error);
            alert('Failed to export applications.');
        }
    });

    applicationsTableBody.addEventListener('click', async (e) => {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const appId = e.target.getAttribute('data-id');
            if (confirm(`Are you sure you want to delete this application?`)) {
                await fetch(`http://localhost:8000/api/applications/${appId}`, {
                    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchAndDisplayApplications();
            }
        }
    });

    // --- INITIAL LOAD ---
    populateRoleFilter();
    fetchAndDisplayApplications();
});