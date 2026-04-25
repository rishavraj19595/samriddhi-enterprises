document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');

    if (mobileMenu && navbar) {
        mobileMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://your-backend.onrender.com';

    // Profile Dropdown Elements
    const profileDropdown = document.getElementById('profileDropdown');
    const profileIcon = document.getElementById('profileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const openSettings = document.getElementById('openSettings');

    // Settings Modal Elements
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const settingsForm = document.getElementById('settingsForm');

    // Hero Greeting & Auth Link
    const heroGreeting = document.getElementById('heroGreeting');
    const authLink = document.getElementById('authLink');
    const username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');

    if (token && username) {
        // Toggle Profile Icons
        if (authLink) authLink.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'block';

        // Dropdown Toggle
        if (profileIcon) {
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
            });
        }

        // Close dropdown on click outside
        window.addEventListener('click', () => {
            if (dropdownMenu) dropdownMenu.classList.remove('active');
        });

        // Logout logic
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('username');
                window.location.href = '/';
            });
        }

        // Settings Modal logic
        if (openSettings && settingsModal) {
            openSettings.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent dropdown from closing prematurely
                
                // Show loading state
                const originalText = openSettings.innerHTML;
                openSettings.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                
                try {
                    const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (!res.ok) throw new Error(`Server returned ${res.status}`);
                    
                    const data = await res.json();
                    if (data.success) {
                        document.getElementById('settingsUsername').value = data.user.username;
                        document.getElementById('settingsDOB').value = data.user.dob || '';
                        settingsModal.classList.add('active');
                        if (dropdownMenu) dropdownMenu.classList.remove('active'); // Close dropdown once modal is open
                    } else {
                        throw new Error(data.error || 'Failed to load profile');
                    }
                } catch (err) {
                    console.error('Profile fetch error:', err);
                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Error', 'Could not load profile data. Please try again.', 'error');
                    } else {
                        alert('Could not load profile. Please check your connection.');
                    }
                } finally {
                    openSettings.innerHTML = originalText;
                }
            });
        }

        // Close modal
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });
        }

        // Form Submission
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const updatedData = {
                    username: document.getElementById('settingsUsername').value,
                    dob: document.getElementById('settingsDOB').value,
                    originalPassword: document.getElementById('settingsOldPassword').value,
                    newPassword: document.getElementById('settingsNewPassword').value
                };

                try {
                    const res = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updatedData)
                    });
                    const data = await res.json();
                    if (data.success) {
                        sessionStorage.setItem('username', data.username);
                        if (typeof Swal !== 'undefined') {
                            Swal.fire('Success', 'Profile updated successfully!', 'success').then(() => {
                                window.location.reload();
                            });
                        } else {
                            alert('Profile updated successfully!');
                            window.location.reload();
                        }
                    } else {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire('Error', data.error || 'Update failed', 'error');
                        } else {
                            alert(data.error || 'Update failed');
                        }
                    }
                } catch (err) {
                    console.error('Update failed', err);
                }
            });
        }

        // Dynamic typing effect for Home Page Hero
        if (heroGreeting) {
            const text = `Hi ${username}, Welcome!`;
            let i = 0;
            heroGreeting.textContent = '';
            function typeWriter() {
                if (i < text.length) {
                    heroGreeting.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            }
            typeWriter();
        }
    } else {
        if (authLink) {
            authLink.style.display = 'block';
            authLink.textContent = 'Login';
            authLink.href = '/login';
        }
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
});
