const signUpButton = document.getElementById('signUp');
const loginButton = document.getElementById('login');
const container = document.querySelector('.container');

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

loginButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// API Integration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://samriddhi-backend-zavs.onrender.com'; // <--- REPLACE THIS with your actual Render URL later

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const signupMsg = document.getElementById('signupMsg');
const loginMsg = document.getElementById('loginMsg');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            signupMsg.style.color = 'green';
            signupMsg.textContent = 'Registration successful! You can now login.';
            setTimeout(() => {
                loginButton.click(); // Switch to login after 2s
                signupForm.reset();
                signupMsg.textContent = '';
            }, 2000);
        } else {
            signupMsg.style.color = 'red';
            signupMsg.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        signupMsg.style.color = 'red';
        signupMsg.textContent = 'Server error';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            loginMsg.style.color = 'green';
            loginMsg.textContent = 'Login successful!';
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('username', data.username);
            setTimeout(() => {
                window.location.href = '/'; // Redirect
            }, 1000);
        } else {
            loginMsg.style.color = 'red';
            loginMsg.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        loginMsg.style.color = 'red';
        loginMsg.textContent = 'Server error';
    }
});
