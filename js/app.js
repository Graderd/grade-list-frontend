const formulario = document.getElementById("formulario-tarea");
const tituloInput = document.getElementById("titulo");
const mensajeInput = document.getElementById("mensajes");
const tareas = document.getElementById("tareas");
const contadorTareas = document.getElementById("cantidad-tareas");
const textoContador = document.getElementById("texto-contador");
const filtros = document.querySelectorAll(".filtro");
const botonCerrarSesion = document.getElementById("cerrar-sesion");
const botonAgregar = formulario.querySelector('button[type="submit"]');

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

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = tituloInput.value.trim();

    mensajeInput.textContent = "";
    mensajeInput.className = "mensaje";

    if (!validarTitulo(titulo)) {
        return;
    }

    botonAgregar.disabled = true;
    cancelarEdicion();

    try {
        const respuesta = await fetch(`${API_URL}/api/tareas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo
            })
        });

        if (manejarSesionExpirada(respuesta)) {
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajeInput.textContent = datos.error;
            mensajeInput.className = "mensaje error";
            return;
        }

        crearTarea(
            datos.data.titulo,
            datos.data.id,
            false
        );

        mensajeInput.textContent = datos.message;
        mensajeInput.className = "mensaje exito";

        tituloInput.value = "";

        const filtroActivo = document.querySelector(".filtro.activo");
        const filtroSeleccionado = filtroActivo.dataset.filtro;

        filtrarTareas(filtroSeleccionado);

    } catch (error) {
        mensajeInput.textContent = "No se pudo crear la tarea.";
        mensajeInput.className = "mensaje error";
    } finally {
        botonAgregar.disabled = false;
    }
});

function manejarSesionExpirada(respuesta) {
    if (respuesta.status === 401) {
        sessionStorage.clear();
        window.location.href = "login.html";
        return true;
    }

    return false;
}

function crearTarea(titulo, id = null, completada = false) {
    const nuevaTarea = document.createElement("li");
    nuevaTarea.classList.add("tarea");
    nuevaTarea.dataset.estado = completada ? "completada" : "pendiente";

    if (id !== null) {
        nuevaTarea.dataset.id = id;
    }

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("checkbox-tarea");
    checkbox.checked = completada;

    const tituloTarea = document.createElement("span");
    tituloTarea.classList.add("titulo");
    tituloTarea.textContent = titulo;

    label.appendChild(checkbox);
    label.appendChild(tituloTarea);

    nuevaTarea.appendChild(label);
    
    // Agregar el estado de la tarea
    const estadoTarea = document.createElement("span");
    estadoTarea.classList.add("estado");
    estadoTarea.textContent = completada ? "Completada" : "Pendiente";
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
    checkbox.addEventListener("change", async () => {
        cancelarEdicion();

        const idTarea = nuevaTarea.dataset.id;
        checkbox.disabled = true;

        try {
            const respuesta = await fetch(
                `${API_URL}/api/tareas/${idTarea}/toggle`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (manejarSesionExpirada(respuesta)) {
                return;
            }

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                checkbox.checked = !checkbox.checked;

                mensajeInput.textContent = datos.error;
                mensajeInput.className = "mensaje error";
                return;
            }

        } catch (error) {
            checkbox.checked = !checkbox.checked;

            mensajeInput.textContent = "No se pudo actualizar el estado de la tarea.";
            mensajeInput.className = "mensaje error";
            return;
        } finally {
            checkbox.disabled = false;
        }

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

        inputEditar.addEventListener("keydown", async (e) => {
            if(e.key === "Enter"){
                //aqui
                const nuevoTitulo = inputEditar.value.trim();
                inputEditar.disabled = true;

                mensajeInput.textContent = "";
                mensajeInput.className = "mensaje";

                if (!validarTitulo(nuevoTitulo)) {
                    return;
                }

                const idTarea = nuevaTarea.dataset.id;

                try {
                    const respuesta = await fetch(
                        `${API_URL}/api/tareas/${idTarea}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                titulo: nuevoTitulo
                            })
                        }
                    );

                    if (manejarSesionExpirada(respuesta)) {
                        return;
                    }

                    const datos = await respuesta.json();

                    if (!respuesta.ok) {
                        mensajeInput.textContent = datos.error;
                        mensajeInput.className = "mensaje error";
                        inputEditar.focus();
                        return;
                    }

                    tituloTarea.textContent = nuevoTitulo;
                    label.replaceChild(tituloTarea, inputEditar);

                    edicionActiva = null;

                    mensajeInput.textContent =
                        datos.message || "Tarea actualizada correctamente.";
                    mensajeInput.className = "mensaje exito";

                } catch (error) {
                    mensajeInput.textContent = "No se pudo actualizar la tarea.";
                    mensajeInput.className = "mensaje error";
                    inputEditar.focus();
                } finally {
                    inputEditar.disabled = false;
                }
            }
            else if(e.key === "Escape"){
                cancelarEdicion();
            }
        });

    });

    eliminarBtn.addEventListener("click", async () => {
        if (edicionActiva) {
            edicionActiva.inputEditar.focus();
            return;
        }

        const idTarea = nuevaTarea.dataset.id;
        eliminarBtn.disabled = true;

        try {
            const respuesta = await fetch(
                `${API_URL}/api/tareas/${idTarea}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (manejarSesionExpirada(respuesta)) {
                return;
            }

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mensajeInput.textContent = datos.error;
                mensajeInput.className = "mensaje error";
                return;
            }

            eliminarTarea(nuevaTarea);

            mensajeInput.textContent = datos.message || "Tarea eliminada correctamente.";
            mensajeInput.className = "mensaje exito";

        } catch (error) {
            mensajeInput.textContent = "No se pudo eliminar la tarea.";
            mensajeInput.className = "mensaje error";
        } finally {
            eliminarBtn.disabled = false;
        }
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

async function cargarTareas() {
    try {
        const respuesta = await fetch(`${API_URL}/api/tareas`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (manejarSesionExpirada(respuesta)) {
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajeInput.textContent = datos.error;
            mensajeInput.className = "mensaje error";
            return;
        }

        tareas.innerHTML = "";

        datos.data.forEach((tarea) => {
            crearTarea(
                tarea.titulo,
                tarea.id,
                Number(tarea.completada) === 1
            );
        });

        contarTareas();

    } catch (error) {
        mensajeInput.textContent = "No se pudieron cargar las tareas.";
        mensajeInput.className = "mensaje error";
    }
}

cargarTareas();