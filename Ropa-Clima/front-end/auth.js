const BACKEND_URL = "http://localhost:3000/api";

// LÓGICA DE REGISTRO (register.html)
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const messageErrorRegister = document.getElementById('message-error-register')

        if (username === "" || password === "") { 
            return messageErrorRegister.innerHTML = "<p class='error-color'>Por favor, introduce usuario y contraseña.<p>"
        }
        
        try {
            const response = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) { 
                alert(`Registro exitoso. Ya puedes iniciar sesión.`);
                window.location.href = 'login.html';
            } else {
                return messageErrorLogin.innerHTML =`<p class='error-color'>Error al registrar: ${data.message}</p>`
            }
        } catch (error) {
            return messageErrorRegister.innerHTML = "<p class='error-color'>Error de conexión, vuelve más tarde.<p>"
        }
    });
}

// LÓGICA DE INICIO DE SESIÓN (login.html)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('logUsername').value;
        const password = document.getElementById('logPassword').value;
        const messageErrorLogin = document.getElementById('message-error-login')

        if (username === "" || password === "") {
            return messageErrorLogin.innerHTML = "<p class='error-color'>Por favor, introduce usuario y contraseña.<p>"
        }

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {                
                // Guardar el estado de la sesión
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                window.location.href = 'index.html'; 
            } else { 
                return messageErrorLogin.innerHTML ="<p class='error-color'>El usuario o la contraseña no es correcto</p>"
            }
        } catch (error) {
            return messageErrorLogin.innerHTML = "<p class='error-color'>Error de conexión, vuelve más tarde.<p>"
        }
    });
}