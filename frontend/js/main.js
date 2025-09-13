document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Logic ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const navbarLinks = document.getElementById('navbar-links');
    if (mobileMenuButton && navbarLinks) {
        const menuIcon = mobileMenuButton.querySelector('i');
        mobileMenuButton.addEventListener('click', () => {
            navbarLinks.classList.toggle('active');
            if (navbarLinks.classList.contains('active')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            } else {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            }
        });
    }

    // --- Logic for the Service Modal on the Home Page ---
    const modal = document.getElementById('lead-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-button');
        const serviceItems = document.querySelectorAll('.service-item');
        const leadForm = document.getElementById('leadForm');
        const serviceInput = document.getElementById('service');
        const formMessage = document.getElementById('formMessage');

        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                const serviceName = item.getAttribute('data-service');
                serviceInput.value = serviceName;
                modal.classList.add('modal-open');
                formMessage.textContent = '';
            });
        });

        const closeModal = () => modal.classList.remove('modal-open');
        closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => { if (event.target == modal) { closeModal(); } });

        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                serviceRequested: serviceInput.value,
            };
            try {
                const response = await fetch('https://slrproject.netlify.app/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    formMessage.textContent = "Thank you! We'll be in touch shortly.";
                    formMessage.style.color = 'green';
                    leadForm.reset();
                } else {
                    formMessage.textContent = "Something went wrong. Please try again.";
                    formMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // --- Logic for Dynamic Data on the Home Page ---
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const loanAmountElement = document.getElementById('loan-amount');
        const partnersListElement = document.getElementById('partners-list');
        let statsData = {};

        const animateCounters = () => {
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                const targetText = counter.getAttribute('data-target');
                const targetNumber = parseFloat(targetText) || 0;
                
                counter.innerText = '0';
                
                const updateCount = () => {
                    const currentNum = parseFloat(counter.innerText.replace(/[+,CR]/g, '')) || 0;
                    const increment = targetNumber / 100;

                    if (currentNum < targetNumber) {
                        counter.innerText = Math.ceil(currentNum + increment);
                        if (targetText.includes('+')) {
                            counter.innerText += '+';
                        }
                        setTimeout(updateCount, 20);
                    } else {
                        if (counter.id === 'loan-amount') {
                            counter.innerText = statsData.loanDisbursed;
                        } else {
                            counter.innerText = targetText;
                        }
                    }
                };
                updateCount();
            });
        };

        let hasAnimated = false;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                fetchStats().then(() => {
                    animateCounters();
                });
            }
        }, { threshold: 0.1 });
        observer.observe(statsSection);

        const fetchStats = async () => {
            try {
                const response = await fetch('https://slrproject.netlify.app/api/homepage-stats');
                statsData = await response.json();
                const loanAmountValue = parseFloat(statsData.loanDisbursed) || 0;
                loanAmountElement.setAttribute('data-target', loanAmountValue);
            } catch (error) {
                loanAmountElement.textContent = 'N/A';
            }
        };

        const fetchPartners = async () => {
            try {
                const response = await fetch('https://slrproject.netlify.app/api/partners');
                const partners = await response.json();
                partnersListElement.innerHTML = '';
                partners.forEach(partner => {
                    const partnerLogo = document.createElement('div');
                    partnerLogo.className = 'partner-logo-item';
                    partnerLogo.innerHTML = `<img src="${partner.logoUrl}" alt="${partner.bankName} Logo">`;
                    partnersListElement.appendChild(partnerLogo);
                });
            } catch (error) {
                partnersListElement.innerHTML = '<p>Could not load partners.</p>';
            }
        };
        
        fetchPartners();
    }

    // --- Logic for the Founders Scroller (Auto-Scroll Version) ---
    const foundersContainer = document.getElementById('founders-container');
    if (foundersContainer) {
        const slides = foundersContainer.querySelectorAll('.founder-slide');
        if (slides.length > 1) {
            let currentSlide = 0;
            let scrollInterval;
            const autoScroll = () => {
                currentSlide = (currentSlide + 1) % slides.length;
                const scrollAmount = currentSlide * foundersContainer.clientWidth;
                foundersContainer.scrollTo({ left: scrollAmount, behavior: 'smooth' });
            };
            const startScrolling = () => { scrollInterval = setInterval(autoScroll, 5000); };
            const stopScrolling = () => { clearInterval(scrollInterval); };
            
            foundersContainer.addEventListener('mouseenter', stopScrolling);
            foundersContainer.addEventListener('mouseleave', startScrolling);
            
            startScrolling();
        }
    }
});