document.addEventListener('DOMContentLoaded', async () => {
    const jobListingsContainer = document.getElementById('job-listings');
    const applicationModal = document.getElementById('application-modal');
    const closeModalBtn = applicationModal.querySelector('.close-button');
    const applicationForm = document.getElementById('applicationForm');
    const modalJobTitle = document.getElementById('modal-job-title');
    const jobIdInput = document.getElementById('jobId');
    const applicationMessage = document.getElementById('applicationMessage');

    const openApplicationModal = (job) => {
        modalJobTitle.textContent = job.roleTitle;
        jobIdInput.value = job.id;
        applicationModal.style.display = 'block';
    };

    const closeApplicationModal = () => {
        applicationModal.style.display = 'none';
        applicationForm.reset();
        applicationMessage.textContent = '';
    };

    closeModalBtn.addEventListener('click', closeApplicationModal);
    window.addEventListener('click', (event) => {
        if (event.target == applicationModal) {
            closeApplicationModal();
        }
    });

    try {
        const response = await fetch('https://slrproject.netlify.app/api/jobs');
        const jobs = await response.json();

        if (jobs.length === 0) {
            jobListingsContainer.innerHTML = '<p>No open positions at this time.</p>';
            return;
        }

        jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'job-posting';
            
            // This structure matches our new CSS for the card layout
            jobElement.innerHTML = `
                <div class="job-details">
                    <h3>${job.roleTitle}</h3>
                    <p class="openings">Openings: ${job.openingsCount}</p>
                    <div class="description">${job.jobDescription.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="job-apply">
                    <button class="button">Apply Now</button>
                </div>
            `;

            // Find the button we just created and add the click listener
            jobElement.querySelector('.job-apply .button').addEventListener('click', () => openApplicationModal(job));
            
            jobListingsContainer.appendChild(jobElement);
        });

    } catch (error) {
        console.error('Failed to fetch job listings:', error);
        jobListingsContainer.innerHTML = '<p>Sorry, unable to load job listings.</p>';
    }

    applicationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(applicationForm);

        try {
            const response = await fetch('https://slrproject.netlify.app/api/applications', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                applicationMessage.textContent = result.message;
                applicationMessage.style.color = 'green';
                setTimeout(closeApplicationModal, 2000);
            } else {
                applicationMessage.textContent = result.error || 'Submission failed.';
                applicationMessage.style.color = 'red';
            }
        } catch (error) {
            applicationMessage.textContent = 'An error occurred. Please try again.';
            applicationMessage.style.color = 'red';
        }
    });
});