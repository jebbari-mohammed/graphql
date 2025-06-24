export function Showlogin(){
    document.body.innerHTML = '';
    const loginContainer = document.createElement('div');
    loginContainer.innerHTML = loginForm;
    document.body.appendChild(loginContainer);

    const loginFormElement = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const urlSignin = "https://learn.zone01oujda.ma/api/auth/signin"


    loginFormElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;
        const convertData = btoa(`${username}:${password}`)

        try {
            const response = await fetch(urlSignin, {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    "Authorization": `Basic ${convertData}`
                }
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const jwt = await response.json();
            console.log(jwt);
            localStorage.setItem('jwt', jwt);
            window.location.reload();
        } catch (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        }
    });
}
const loginForm = `
<div class="login-container">
    <h2>Login</h2>
    <form id="loginForm">
        <div class="form-group">
            <label for="username">Username OR Email:</label>
            <input type="text" id="username" name="username"  required>
        </div>
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
    </form>
    <div id="loginError" class="error-message" style="display:none;"></div>
</div>
`