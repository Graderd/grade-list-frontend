const formularioLogin = document.getElementById("formulario-login");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const mensajeInput = document.getElementById("mensajes");
const botonPassword = document.querySelector(".mostrar-password");

botonPassword.addEventListener("click", () => {
    const icono = botonPassword.querySelector(".material-symbols-outlined");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icono.textContent = "visibility_off";
        botonPassword.setAttribute("aria-label", "Ocultar contraseña");
    } else {
        passwordInput.type = "password";
        icono.textContent = "visibility";
        botonPassword.setAttribute("aria-label", "Mostrar contraseña");
    }
});

formularioLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    mensajeInput.textContent = "";
    mensajeInput.className = "mensaje";

    const correo = correoInput.value.trim();
    const password = passwordInput.value;

    if (correo === "") {
        mensajeInput.textContent = "El correo no puede estar vacío.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (correo.length > 255) {
        mensajeInput.textContent = "El correo no puede tener más de 255 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (!correoInput.validity.valid) {
        mensajeInput.textContent = "Ingresa un correo electrónico válido.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (password === "") {
        mensajeInput.textContent = "La contraseña no puede estar vacía.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (password.length < 8) {
        mensajeInput.textContent = "La contraseña debe tener al menos 8 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (password.length > 72) {
        mensajeInput.textContent = "La contraseña no puede tener más de 72 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    }

    try {
        const respuesta = await fetch("http://api.home/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: correo,
                password
            })
        });

        const datos = await respuesta.json();

        console.log(datos);

    } catch (error) {
        mensajeInput.textContent = "No se pudo conectar con el servidor.";
        mensajeInput.className = "mensaje error";
    }
});