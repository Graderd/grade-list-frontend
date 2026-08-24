const botonesPassword = document.querySelectorAll(".mostrar-password");
const formularioRegistro = document.getElementById("formulario-registro");
const passwordInput = document.getElementById("password");
const confirmarPasswordInput = document.getElementById("confirmarPassword");
const mensajeInput = document.getElementById("mensajes");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");

botonesPassword.forEach((boton) => {
    boton.addEventListener("click", () => {

        const contenedor = boton.parentElement;
        const input = contenedor.querySelector("input");
        const icono = boton.querySelector(".material-symbols-outlined");

        if(input.type === "password"){
            input.type = "text";
            icono.textContent = "visibility_off";
            boton.setAttribute("aria-label", "Ocultar contraseña");
        }else {
            input.type = "password"
            icono.textContent = "visibility";
            boton.setAttribute("aria-label", "Mostrar contraseña");
        }
    });
});

formularioRegistro.addEventListener("submit", (e) => {
    e.preventDefault();

    mensajeInput.textContent = "";
    mensajeInput.className = "mensaje";
    
    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const password = passwordInput.value;
    const confirmarPassword = confirmarPasswordInput.value;



    if (nombre === "") {
        mensajeInput.textContent = "El nombre no puede estar vacío.";
        mensajeInput.className = "mensaje error";
        return;

    } else if (nombre.length < 3) {
        mensajeInput.textContent = "El nombre debe tener al menos 3 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    }

    if (nombre.length > 100) {
    mensajeInput.textContent = "El nombre no puede tener más de 100 caracteres.";
    mensajeInput.className = "mensaje error";
    return;
    }

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

    if (confirmarPassword === "") {
    mensajeInput.textContent = "Debes confirmar la contraseña.";
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

    if (password !== confirmarPassword) {
        mensajeInput.textContent = "Las contraseñas no coinciden.";
        mensajeInput.className = "mensaje error";
        return;
    }

});

