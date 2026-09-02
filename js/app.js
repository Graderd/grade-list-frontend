const formulario = document.getElementById("formulario-tarea");
const tituloInput = document.getElementById("titulo");
const mensajeInput = document.getElementById("mensajes");
const tareas = document.getElementById("tareas");
const contadorTareas = document.getElementById("cantidad-tareas");
const textoContador = document.getElementById("texto-contador");
const filtros = document.querySelectorAll(".filtro");
const botonCerrarSesion = document.getElementById("cerrar-sesion");

let edicionActiva = null;

const token = sessionStorage.getItem("token");
const usuarioGuardado = sessionStorage.getItem("usuario");

if (!token || !usuarioGuardado) {
    window.location.href = "login.html";
}

const nombreUsuario = document.getElementById("nombre-usuario");

if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nombreUsuario.textContent = `Hola, ${usuario.nombre}`;
}

botonCerrarSesion.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "login.html";
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = tituloInput.value.trim();

    mensajeInput.textContent = "";
    mensajeInput.className = "mensaje";

    if (!validarTitulo(titulo)) {
        return;
    }

    cancelarEdicion();

    mensajeInput.textContent = "Tarea agregada correctamente.";
    mensajeInput.className = "mensaje exito";

    crearTarea(titulo);

    tituloInput.value = "";
    
    const filtroActivo = document.querySelector(".filtro.activo");
    const filtroSeleccionado = filtroActivo.dataset.filtro;

    filtrarTareas(filtroSeleccionado);
});

function crearTarea(titulo) {
    const nuevaTarea = document.createElement("li");
    nuevaTarea.classList.add("tarea");
    nuevaTarea.dataset.estado = "pendiente";

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox-tarea");

    const tituloTarea = document.createElement("span");
    tituloTarea.classList.add("titulo");
    tituloTarea.textContent = titulo;

    label.appendChild(checkbox);
    label.appendChild(tituloTarea);

    nuevaTarea.appendChild(label);
    
    // Agregar el estado de la tarea
    const estadoTarea = document.createElement("span");
    estadoTarea.classList.add("estado");
    estadoTarea.textContent = "Pendiente";
    nuevaTarea.appendChild(estadoTarea);

    // Agregar botones de editar y eliminar
    const editarBtn = document.createElement("button");
    editarBtn.type = "button";
    editarBtn.setAttribute("aria-label", "Editar tarea");
    editarBtn.title = "Editar";
    editarBtn.classList.add("editar");
    
    // Agregar icono y texto al botón de editar
    const editarIcono = document.createElement("span");
    editarIcono.classList.add("material-symbols-outlined");
    editarIcono.setAttribute("aria-hidden", "true");
    editarIcono.textContent = "edit";
    editarBtn.appendChild(editarIcono);

    // Agregar texto al botón de editar
    const editarSpan = document.createElement("span");
    editarSpan.classList.add("texto-boton");
    editarSpan.textContent = "Editar";
    editarBtn.appendChild(editarSpan);

    nuevaTarea.appendChild(editarBtn);

    // Agregar botón de eliminar
    const eliminarBtn = document.createElement("button");
    eliminarBtn.type = "button";
    eliminarBtn.setAttribute("aria-label", "Eliminar tarea");
    eliminarBtn.title = "Eliminar";
    eliminarBtn.classList.add("eliminar");

    // Agregar icono y texto al botón de eliminar
    const eliminarIcono = document.createElement("span");
    eliminarIcono.classList.add("material-symbols-outlined");
    eliminarIcono.setAttribute("aria-hidden", "true");
    eliminarIcono.textContent = "delete";
    eliminarBtn.appendChild(eliminarIcono);

    // Agregar texto al botón de eliminar
    const eliminarSpan = document.createElement("span");
    eliminarSpan.classList.add("texto-boton");
    eliminarSpan.textContent = "Eliminar";
    eliminarBtn.appendChild(eliminarSpan);

    nuevaTarea.appendChild(eliminarBtn);

    tareas.appendChild(nuevaTarea);

    // Agregar evento al checkbox para cambiar el estado de la tarea
    checkbox.addEventListener("change", () => {
        cancelarEdicion();

        if (checkbox.checked) {
            nuevaTarea.dataset.estado = "completada";
            estadoTarea.textContent = "Completada";
        } else {
            nuevaTarea.dataset.estado = "pendiente";
            estadoTarea.textContent = "Pendiente";
        }

        const filtroActivo = document.querySelector(".filtro.activo");
        const filtroSeleccionado = filtroActivo.dataset.filtro;

        filtrarTareas(filtroSeleccionado);
    });

    //editar tarea
    editarBtn.addEventListener("click", () => {
        mensajeInput.textContent = "";
        mensajeInput.className = "mensaje";

        if (edicionActiva) {
            edicionActiva.inputEditar.focus();
            return;
        }

        const inputEditar = document.createElement("input");

        inputEditar.value = tituloTarea.textContent;
        inputEditar.classList.add("input-editar");

        label.replaceChild(inputEditar, tituloTarea);

        inputEditar.focus();
        inputEditar.select();

        edicionActiva = {
            label,
            tituloTarea,
            inputEditar
        }

        inputEditar.addEventListener("keydown", (e) => {
            if(e.key === "Enter"){
                //aqui
                const nuevoTitulo = inputEditar.value.trim();

                mensajeInput.textContent = "";
                mensajeInput.className = "mensaje";

                if (!validarTitulo(nuevoTitulo)) {
                    return;
                }

                tituloTarea.textContent = nuevoTitulo;
                label.replaceChild(tituloTarea, inputEditar);

                edicionActiva = null;

                mensajeInput.textContent = "Tarea actualizada correctamente.";
                mensajeInput.className = "mensaje exito";

                console.log("Nuevo titulo:", nuevoTitulo);
            }
            else if(e.key === "Escape"){
                cancelarEdicion();
            }
        });

    });

    eliminarBtn.addEventListener("click", () => {
        if (edicionActiva) {
            edicionActiva.inputEditar.focus();
            return;
        }

        eliminarTarea(nuevaTarea);
    });
}

function eliminarTarea(tarea){
    tarea.remove();
    contarTareas();
}


function contarTareas() {
    const filtroActivo = document.querySelector(".filtro.activo");
    const filtroSeleccionado = filtroActivo.dataset.filtro;

    let cantidadTareas;

    if (filtroSeleccionado === "todas") {
        cantidadTareas = tareas.children.length;

    } else if (filtroSeleccionado === "pendientes") {
        cantidadTareas = Array.from(tareas.children)
            .filter((tarea) => tarea.dataset.estado === "pendiente")
            .length;

    } else if (filtroSeleccionado === "completadas") {
        cantidadTareas = Array.from(tareas.children)
            .filter((tarea) => tarea.dataset.estado === "completada")
            .length;
    }

    contadorTareas.textContent = cantidadTareas;
    textoContador.textContent = cantidadTareas === 1 ? "tarea" : "tareas";
}

filtros.forEach((boton) => {
    boton.addEventListener("click", () => {

        cancelarEdicion();

        filtros.forEach((b) => b.classList.remove("activo"));
        boton.classList.add("activo");

        const filtroSeleccionado = boton.dataset.filtro;
        filtrarTareas(filtroSeleccionado);
    });
});

function filtrarTareas(filtro) {
    const todasLasTareas = document.querySelectorAll(".tarea");

    todasLasTareas.forEach((tarea) => {
        if (filtro === "pendientes"){
            tarea.dataset.estado === "pendiente" ? tarea.style.display = "flex" : tarea.style.display = "none";
        }
        else if (filtro === "completadas"){
            tarea.dataset.estado === "completada" ? tarea.style.display = "flex" : tarea.style.display = "none";
        }
        else if (filtro === "todas"){
            tarea.style.display = "flex";
        }
    });
    contarTareas();
}

function validarTitulo(titulo) {
    if (titulo === "") {
        mensajeInput.textContent = "El título no puede estar vacío.";
        mensajeInput.className = "mensaje error";
        return false;

    } else if (titulo.length < 3) {
        mensajeInput.textContent = "El título debe tener al menos 3 caracteres.";
        mensajeInput.className = "mensaje error";
        return false;

    } else if (titulo.length > 50) {
        mensajeInput.textContent = "El título no puede tener más de 50 caracteres.";
        mensajeInput.className = "mensaje error";
        return false;
    }

    return true;
}

function cancelarEdicion() {
    if (!edicionActiva) {
        return;
    }

    const { label, tituloTarea, inputEditar } = edicionActiva;

    label.replaceChild(tituloTarea, inputEditar);

    edicionActiva = null;
}