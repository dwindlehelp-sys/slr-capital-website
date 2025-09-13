// document.addEventListener('DOMContentLoaded', () => {
//     const loanAmountElement = document.getElementById('loan-amount');
//     const partnersListElement = document.getElementById('partners-list');
//     const statsSection = document.querySelector('.stats');

//     // --- COUNT-UP ANIMATION LOGIC ---
//     const animateCounters = () => {
//         const counters = document.querySelectorAll('.counter');
//         const speed = 200; // A lower number means a faster animation

//         counters.forEach(counter => {
//             const updateCount = () => {
//                 const target = +counter.getAttribute('data-target');
//                 const countText = counter.innerText.replace(/[+,CR]/g, '').trim();
//                 const count = +countText;
                
//                 // Calculate the increment
//                 const increment = target / speed;

//                 if (count < target) {
//                     // Update the number and re-add any original text like '+' or 'CR'
//                     const newCount = Math.ceil(count + increment);
//                     counter.innerText = newCount;
//                     if (counter.id === 'loan-amount') {
//                         counter.innerText += ' CR';
//                     } else if (counter.getAttribute('data-target').includes('+')) {
//                         counter.innerText += '+';
//                     }
//                     setTimeout(updateCount, 10); // Adjust timing for smoothness
//                 } else {
//                     // Ensure final text is correct
//                     if (counter.id === 'loan-amount') {
//                         counter.innerText = stats.loanDisbursed;
//                     } else {
//                         counter.innerText = target + (counter.getAttribute('data-target').includes('+') ? '+' : '');
//                     }
//                 }
//             };

//             // Start with 0 before counting up
//             if (counter.id !== 'loan-amount') {
//                 counter.innerText = '0' + (counter.getAttribute('data-target').includes('+') ? '+' : '');
//             }
//             updateCount();
//         });
//     };

//     // --- INTERSECTION OBSERVER to trigger animation on scroll ---
//     // This watches the stats section and triggers the animation when it's visible
//     let hasAnimated = false; // Flag to ensure animation only runs once
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting && !hasAnimated) {
//                 hasAnimated = true;
//                 animateCounters();
//             }
//         });
//     }, { threshold: 0.1 }); // Trigger when 10% of the section is visible

//     if (statsSection) {
//         observer.observe(statsSection);
//     }

//     // --- API FETCHING LOGIC ---
//     let stats = {}; // To store the fetched stats
//     const fetchStats = async () => {
//     try {
//         const response = await fetch('http://localhost:8000/api/homepage-stats');
//         stats = await response.json();

//         // --- ADD THESE TWO LINES FOR DEBUGGING ---
//         console.log("Raw value from API:", stats.loanDisbursed);
//         const loanAmountValue = parseFloat(stats.loanDisbursed) || 0;
//         console.log("Parsed number for animation:", loanAmountValue);
//         // ------------------------------------------

//         loanAmountElement.setAttribute('data-target', loanAmountValue);
//         loanAmountElement.textContent = `0 CR`; // Starts at 0 for the animation
//     } catch (error) {
//         console.error('Failed to fetch stats:', error);
//         loanAmountElement.textContent = 'N/A';
//     }
// };

//     const fetchPartners = async () => {
//         try {
//             const response = await fetch('http://localhost:8000/api/partners');
//             const partners = await response.json();
            
//             partnersListElement.innerHTML = ''; 
//             partners.forEach(partner => {
//                 const partnerDiv = document.createElement('div');
//                 partnerDiv.className = 'partner-item';
//                 partnerDiv.innerHTML = `<span>${partner.bankName}</span>`;
//                 partnersListElement.appendChild(partnerDiv);
//             });
//         } catch (error) {
//             console.error('Failed to fetch partners:', error);
//             partnersListElement.innerHTML = '<p>Could not load partners.</p>';
//         }
//     };

//     fetchStats();
//     fetchPartners();
// });