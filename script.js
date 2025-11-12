document.addEventListener("DOMContentLoaded", () => {
    const authView = document.getElementById("authView");
    const homeView = document.getElementById("homeView");
    const formsContainer = document.getElementById("formsContainer");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    window.switchToRegister = () => {
        formsContainer.style.transform = "translateX(-50%)";
    };

    window.switchToLogin = () => {
        formsContainer.style.transform = "translateX(0%)";
    };

    window.logout = () => {
        homeView.classList.remove("active");
        authView.classList.add("active");
    };
    
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Login intentado. Acceso a Home deshabilitado.");
        alert("💥 ¡El acceso a 'Home' está deshabilitado! Permanecerás en Login.");
        loginForm.reset();
    });
    
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Registro exitoso (simulado)");
        alert("★ ¡Registro exitoso! Ahora inicia sesión.");
        switchToLogin(); 
        registerForm.reset();
    });
});

