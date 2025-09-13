document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const jobsList = document.getElementById('jobsList');
    const addJobForm = document.getElementById('addJobForm');
    const searchInput = document.getElementById('searchInput');

    const fetchAndDisplayJobs = async (searchTerm = '') => {
        try {
            const url = `https://slrproject.netlify.app/api/jobs?search=${searchTerm}`;
            const response = await fetch(url); // Public route, no token needed for GET

            const jobs = await response.json();
            jobsList.innerHTML = '';

            if (jobs.length === 0) {
                jobsList.innerHTML = '<li>No job openings found.</li>';
                return;
            }

            jobs.forEach(job => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${job.roleTitle} (${job.openingsCount} openings)</span>`;
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i> Delete`;
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete the "${job.roleTitle}" position?`)) {
                        await fetch(`https://slrproject.netlify.app/api/jobs/${job.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        fetchAndDisplayJobs(searchInput.value); // Re-fetch
                    }
                });
                li.appendChild(deleteButton);
                jobsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobsList.innerHTML = '<li>Error loading jobs.</li>';
        }
    };

    addJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const roleTitle = document.getElementById('roleTitle').value;
        const openingsCount = document.getElementById('openingsCount').value;
        const jobDescription = document.getElementById('jobDescription').value;
        
        const response = await fetch('https://slrproject.netlify.app/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ roleTitle, openingsCount, jobDescription }),
        });

        if (response.ok) {
            addJobForm.reset();
            fetchAndDisplayJobs(); // Refresh the list
        } else {
            alert('Failed to add job opening.');
        }
    });

    searchInput.addEventListener('input', () => {
        fetchAndDisplayJobs(searchInput.value);
    });

    // Initial load
    fetchAndDisplayJobs();
});