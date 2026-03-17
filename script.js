// ===================================================================
// DSEU INSIDERS - COMPLETE SCRIPT
// ===================================================================

// --- Announcements for Homepage ---
async function loadAnnouncements() {
    const updatesWrapper = document.getElementById('updatesContentWrapper');
    if (!updatesWrapper) return; // Only run if the element exists

    try {
        const querySnapshot = await db.collection('announcements')
            .where('isVisible', '==', true)
            .orderBy('timestamp', 'desc')
            .get();

        if (querySnapshot.empty) {
            updatesWrapper.innerHTML = '<div class="update-item">No recent updates. Check back soon!</div>';
            return;
        }

        // In js/script.js

        let updatesHTML = '';
        querySnapshot.forEach(doc => {
            const news = doc.data();

            // Check if there is a link
            if (news.link) {
                // Render as clickable link
                updatesHTML += `
            <div class="update-item">
                <a href="${news.link}" target="_blank" class="flex items-center gap-2 hover:underline">
                    ${news.text} 
                    <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
            </div>`;
            } else {
                // Render as plain text
                updatesHTML += `<div class="update-item">${news.text}</div>`;
            }
        });
        updatesWrapper.innerHTML = updatesHTML;

        // In script.js inside loadAnnouncements function:
        updatesWrapper.innerHTML = updatesHTML;


    } catch (error) {
        console.error("Error loading announcements:", error);
        updatesWrapper.innerHTML = '<div class="update-item">Could not load updates.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
});

// --- Homepage Course Previews (PROFESSIONAL + DYNAMIC STATS) ---
async function loadCoursePreviewsForHomepage(user, userData) {
    const grid = document.getElementById('course-previews-grid');
    if (!grid) return;

    try {
        const querySnapshot = await db.collection('coursePreviews')
            .where('isActive', '==', true)
            .get();

        if (querySnapshot.empty) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center"><p class="text-slate-500 dark:text-slate-400 text-lg">New batches coming soon.</p></div>';
            return;
        }

        let cardsHTML = '';

        querySnapshot.forEach(doc => {
            const course = doc.data();
            const courseId = doc.id;
            const discountedPrice = Math.round(course.price - (course.price * course.discount / 100));
            const hasPurchased = userData?.paidCourses?.includes(courseId);

            // --- 1. DYNAMIC DATA FETCHING ---
            // It looks for these fields in Firebase. If missing, it uses the default string.
            const rating = course.rating || '4.8';
            const reviewCount = course.reviewCount || '45';
            const totalHours = course.hours || '20 Hours';
            const lectureCount = course.lectures || '45 Lectures';
            const facultyName = course.faculty || 'DSEU Faculty';

            // --- 2. BUTTON LOGIC ---
            let buttonHTML = '';
            if (user && hasPurchased) {
                buttonHTML = `<a href="${course.page}" class="block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm text-center transition-colors rounded-none">CONTINUE LEARNING</a>`;
            } else if (user && !hasPurchased) {
                buttonHTML = `<a href="dashboard.html" class="block w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-700 dark:hover:bg-slate-200 font-bold text-sm text-center transition-colors rounded-none">ADD TO CART</a>`;
            } else {
                buttonHTML = `<a href="login.html" class="block w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-700 dark:hover:bg-slate-200 font-bold text-sm text-center transition-colors rounded-none">ENROLL NOW</a>`;
            }

            // --- 3. BADGE LOGIC ---
            let badgeHTML = '';
            if (course.discount && course.discount > 0) {
                badgeHTML = `<span class="absolute top-2 left-2 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm">Bestseller</span>`;
            } else {
                badgeHTML = `<span class="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-sm">New</span>`;
            }

            // --- 4. IMAGE LOGIC ---
            let imageSection = '';
            if (course.image) {
                imageSection = `<img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`;
            } else {
                imageSection = `
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-105 transition-transform duration-500"></div>
                    <div class="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span class="text-white font-bold text-lg tracking-wide uppercase opacity-90">
                            ${course.title}
                        </span>
                    </div>
                `;
            }

            // --- 5. GENERATE CARD ---
            cardsHTML += `
                <div class="group bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-600 border border-gray-200 dark:border-slate-800 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full relative overflow-hidden">
                    
                    <div class="relative h-40 overflow-hidden bg-gray-100">
                        ${imageSection}
                        ${badgeHTML}
                    </div>
                    
                    <div class="p-4 flex flex-col flex-grow">
                        
                        <h3 class="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            ${course.title}
                        </h3>
                        
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                            ${facultyName}
                        </p>

                        <div class="flex items-center gap-1 mb-2">
                            <span class="text-sm font-bold text-yellow-600 dark:text-yellow-500">${rating}</span>
                            <div class="flex text-yellow-500">
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                <svg class="w-3 h-3 fill-current text-gray-300 dark:text-gray-600" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400">(${reviewCount})</span>
                        </div>

                        <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span>${totalHours}</span>
                            <span>•</span>
                            <span>${lectureCount}</span>
                        </div>

                        <div class="flex items-center gap-2 mb-4">
                            <span class="text-lg font-bold text-gray-900 dark:text-white">₹${discountedPrice}</span>
                            <span class="text-sm text-gray-400 line-through">₹${course.price}</span>
                        </div>

                        <div class="mt-auto">
                            ${buttonHTML}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = cardsHTML;

    } catch (error) {
        console.error("Error loading courses:", error);
        grid.innerHTML = '<p class="text-center text-red-500 col-span-full">Could not load courses.</p>';
    }
}


// --- General UI Logic (Menu, Modals, Animations) ---
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

const fadeInSections = document.querySelectorAll('.fade-in-section');
const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
fadeInSections.forEach(section => {
    sectionObserver.observe(section);
});

const helpdeskModal = document.getElementById('helpdeskModal');
const closeHelpdeskModal = document.getElementById('closeHelpdeskModal');

function openHelpdeskModal() {
    if (helpdeskModal) {
        helpdeskModal.classList.add('is-open');
    }
}
if (closeHelpdeskModal) {
    closeHelpdeskModal.addEventListener('click', () => {
        if (helpdeskModal) helpdeskModal.classList.remove('is-open');
    });
}
if (helpdeskModal) {
    helpdeskModal.addEventListener('click', (event) => {
        if (event.target === helpdeskModal) helpdeskModal.classList.remove('is-open');
    });
}

function showMaintenance() {
    alert('This feature is currently under maintenance. Please check back soon!');
}

// --- Global Authentication UI Updates (for Homepage) ---
auth.onAuthStateChanged(async (user) => {
    const authButton = document.getElementById('authButton');
    const authButtonMobile = document.getElementById('authButtonMobile');

    if (authButton && authButtonMobile) {
        if (user) {
            authButton.textContent = 'Dashboard';
            authButton.href = 'dashboard.html';
            authButtonMobile.textContent = 'Dashboard';
            authButtonMobile.href = 'dashboard.html';
        } else {
            authButton.textContent = 'Login';
            authButton.href = 'login.html';
            authButtonMobile.textContent = 'Login';
            authButtonMobile.href = 'login.html';
        }
    }


    // js/script.js - Inside auth.onAuthStateChanged(async (user) => { ... })

    // PARTIAL UPDATE: Replace the "CHECK ADMIN STATUS" block inside auth.onAuthStateChanged

    // ... inside auth.onAuthStateChanged(async (user) => { ...

    if (user) {
        // ... existing code ...

        // --- FIXED ADMIN BUTTON LOGIC ---
        // --- FIXED ADMIN BUTTON LOGIC (RESPONSIVE) ---
        // 1. Get user data to check role
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            const role = userDoc.data().role;
            // Check against ALL allowed roles
            const adminRoles = ['admin', 'super_admin', 'content_manager', 'updates_admin', 'pyq_admin'];

            if (adminRoles.includes(role)) {

                const header = document.querySelector('header .max-w-7xl .flex');

                // Prevent duplicate buttons
                if (header && !document.getElementById('admin-link-btn')) {
                    const adminBtn = document.createElement('a');
                    adminBtn.id = 'admin-link-btn';
                    adminBtn.href = 'admin.html';

                    // --- RESPONSIVE FIX HERE ---
                    // removed 'hidden' -> added 'flex'
                    // added smaller padding/text for mobile (px-3 py-1.5 text-[10px])
                    // added larger padding/text for desktop (md:px-4 md:text-xs)
                    adminBtn.className = 'flex ml-auto mr-2 px-3 py-1.5 md:mr-4 md:px-4 md:py-2 bg-red-600 text-white text-[10px] md:text-xs font-bold rounded-lg shadow hover:bg-red-700 transition items-center gap-1 md:gap-2';

                    adminBtn.innerHTML = `
                        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                        </svg>
                        <span>Admin Panel</span>
                    `;

                    // Insert before the Logout button
                    const logoutBtn = document.getElementById('logoutBtn');
                    if (logoutBtn) {
                        logoutBtn.parentNode.insertBefore(adminBtn, logoutBtn);
                    }
                }
            }
        }
    }

    // ... remaining code ...

    const courseActionButton = document.getElementById('courseActionButton');
    if (courseActionButton) {
        if (user) {
            courseActionButton.href = 'dashboard.html';
        } else {
            courseActionButton.href = '#available-courses-wrapper';
        }
    }

    // Dynamically render homepage courses based on user's auth state and purchases
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : { paidCourses: [] };
            await loadCoursePreviewsForHomepage(user, userData);
        } catch (error) {
            console.error("Error fetching user data for homepage courses:", error);
            await loadCoursePreviewsForHomepage(null, null);
        }
    } else {
        await loadCoursePreviewsForHomepage(null, null);
    }
});


// --- Dashboard Specific Logic ---
if (window.location.pathname.endsWith('/dashboard') || window.location.pathname.endsWith('/dashboard.html')) {
    const courseList = document.getElementById('course-list');
    const instructionBox = document.getElementById('instructionBox');
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');

    async function loadCoursePreviewsFromDB() {
        const courses = [];
        try {
            const querySnapshot = await db.collection('coursePreviews')
                .where('isActive', '==', true)
                .get();
            querySnapshot.forEach(doc => {
                courses.push({ courseId: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error("Error fetching course previews: ", error);
        }
        return courses;
    }

    const instructionBeforePurchase = `
        <div class="bg-blue-100 p-6 rounded-lg text-primary-blue text-sm md:text-base text-left">
            <p class="font-bold mb-2 text-dark-text">How to Purchase a Course:</p>
            <ol class="list-decimal list-inside space-y-1 text-sm md:text-base">
                <li>Click on the "Buy Now" button for the course you want.</li>
                <li>You will be redirected to a Google Form to submit payment details and a screenshot.</li>
                <li>After submission, you will receive an instant confirmation email.</li>
                <li>Please allow 24hrs for manual verification. After verification, the "Buy Now" button will change to "View Course".</li>
                <li>For help, message on WhatsApp: <a href="https://wa.me/917838608325" class="text-accent-orange hover-underline">WhatsApp Support</a> or DM on Instagram: <a href="https://instagram.com/dseuinsiders" target="_blank" class="text-accent-orange hover-underline">Instagram Support</a></li>
            </ol>
        </div>
    `;

    const instructionAfterPurchase = (courseNames) => `
        <div class="bg-blue-100 p-6 rounded-lg text-primary-blue text-sm md:text-base text-left">
            <p class="font-bold mb-2 text-dark-text">Enjoy your course content!</p>
            <p>You have subscribed to the following courses: <strong>${courseNames.join(', ')}</strong>.</p>
            <p class="mt-2">You can access your course by clicking on "View Course." If you want to purchase another course, you can go for it below.</p>
            <p class="mt-4 font-bold text-red-600">This course is non-transferable.</p>
            <p class="text-red-600">You cannot share your login ID or password with anyone else. If this happens, your account will be terminated without any prior notification.</p>
            <p class="mt-4">For any queries or help, contact us on:</p>
            <ul class="list-disc list-inside mt-2">
                <li>WhatsApp: <a href="https://wa.me/917838608325" class="text-accent-orange hover-underline">WhatsApp Support</a></li>
                <li>Email: <a href="mailto:dseuinsiders@gmail.com" class="text-accent-orange hover-underline">dseuinsiders@gmail.com</a></li>
                <li>Instagram DM: <a href="https://instagram.com/dseuinsiders" class="text-accent-orange hover-underline">Instagram Support</a></li>
            </ul>
        </div>
    `;

    function renderCourses(courseData, userCourses) {
        if (!courseList) return;
        courseList.innerHTML = '';
        let hasPurchasedCourses = userCourses && userCourses.length > 0;
        let purchasedCourseNames = [];

        courseData.forEach(course => {
            const isUserPaid = userCourses.includes(course.courseId);
            const discountedPrice = Math.round(course.price - (course.price * course.discount / 100));

            if (isUserPaid) {
                purchasedCourseNames.push(course.title);
            }

            const buttonHTML = isUserPaid
                ? `<a href="${course.page}" class="btn-secondary w-full">View Course</a>`
                : `<a href="${course.buyUrl}" target="_blank" class="btn-primary w-full">Buy Now</a>`;

            const cardHTML = `
                <div class="feature-card animated-card">
                    <h3 class="text-xl font-semibold">${course.title}</h3>
                    <p class="text-gray-600 my-2 text-sm">${course.description}</p>
                    <div class="pricing-card my-4">
                        <div class="original-price">
                            <span class="text-sm font-semibold text-muted-text">Original Price</span>
                            <span class="text-lg font-bold text-gray-400 line-through mr-2">₹${course.price}</span>
                        </div>
                        <div class="current-price">
                            <span class="text-sm font-semibold text-accent-orange">Current Price</span>
                            <span class="text-2xl font-extrabold text-primary-blue">₹${discountedPrice}</span>
                            <span class="text-sm font-semibold text-accent-orange mt-1">(${course.discount}% OFF)</span>
                        </div>
                    </div>
                    ${buttonHTML}
                </div>
            `;
            courseList.innerHTML += cardHTML;
        });

        if (hasPurchasedCourses) {
            instructionBox.innerHTML = instructionAfterPurchase(purchasedCourseNames);
        } else {
            instructionBox.innerHTML = instructionBeforePurchase;
        }
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const allCoursePreviews = await loadCoursePreviewsFromDB();

                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const paidCourses = userData.paidCourses || [];

                    if (userNameElement && userEmailElement) {
                        userNameElement.textContent = userData.name || 'Not provided';
                        userEmailElement.textContent = userData.email || 'Not provided';
                    }

                    renderCourses(allCoursePreviews, paidCourses);

                } else {
                    renderCourses(allCoursePreviews, []);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                const dashboardMessage = document.getElementById('dashboardMessage');
                if (dashboardMessage) dashboardMessage.textContent = 'Error loading dashboard. Please try again.';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error("Logout Error:", error);
                alert("Logout failed. Please try again.");
            }
        });
    }
}

// === AI CHATBOT LOGIC ===
// Removed as AI chat is disabled
// Removed AI chat function






