const formulario = document.getElementById("formulario-tarea");
const tituloInput = document.getElementById("titulo");
const mensajeInput = document.getElementById("mensajes");
const tareas = document.getElementById("tareas");

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = tituloInput.value.trim();

    mensajeInput.textContent = "";
    mensajeInput.className = "mensaje";

    if (titulo === "") {
        mensajeInput.textContent = "El título no puede estar vacío.";
        mensajeInput.className = "mensaje error";
        return;
    } else if (titulo.length < 3) {
        mensajeInput.textContent = "El título debe tener al menos 3 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    } else if (titulo.length > 50) {
        mensajeInput.textContent = "El título no puede tener más de 50 caracteres.";
        mensajeInput.className = "mensaje error";
        return;
    }

    mensajeInput.textContent = "Tarea agregada correctamente.";
    mensajeInput.className = "mensaje exito";

    crearTarea(titulo);

    console.log("Tarea agregada:", titulo);

    tituloInput.value = "";
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
        if (checkbox.checked) {
            nuevaTarea.dataset.estado = "completada";
            estadoTarea.textContent = "Completada";
        } else {
            nuevaTarea.dataset.estado = "pendiente";
            estadoTarea.textContent = "Pendiente";
        }  
    });
}

