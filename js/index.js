//verificar si existe la selección en session storage al cargar la página
const seleccionPrevia = JSON.parse(sessionStorage.getItem('seleccionPrevia')) || {};
const recomendacionesPrevias = JSON.parse(sessionStorage.getItem("recomendacionesPrevias")) || [];
if (seleccionPrevia && recomendacionesPrevias.length > 0) {
    //mostrar recomendaciones generadas previamente
    mostrarSeleccion(seleccionPrevia, true);
    mostrarRecomendaciones(recomendacionesPrevias);
} else {
    //establecer estado default
    limpiarSeleccion();
}

// //TODO: guardar wishlist en local storage
// //verificar si existe una lista de deseos en local storage
// const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
// if (wishlist.length > 0) {

// } else {
//     const wishlistDiv = document.getElementById("wishlist");
//     wishlistDiv.innerHTML = "Aún no tienes libros guardados en tu Lista de Deseos";
// }

//  Event handler para el formulario
const datosUsuario = document.getElementById("datosUsuario");
datosUsuario.addEventListener("submit", (e) => {
    //evitar que la pagina se refresque
    e.preventDefault();

    //limpiar sección de resultados
    limpiarResultados();

    //validar nombre de usuario
    const usuarioTxt = document.getElementById("usuarioTxt");
    const usuario = usuarioTxt.value;
    if (!usuario) {
        const errorUsuario = document.getElementById("errorUsuario");
        errorUsuario.textContent = "Por favor introduce tu nombre";
        return
    }

    //obtener género seleccionado
    const generoList = document.getElementById("generoList");
    const genero = generoList.value;
    const generoText = generoList.options[generoList.selectedIndex].label;
    
    //obtener cantidad de recomendaciones
    const cantRecs = parseInt(document.getElementById("numRecsTxt").value);

    //guardar selección actual en session storage
    let datos = {usuario: usuario, genero: generoText, cantidad: cantRecs};
    sessionStorage.setItem('seleccionPrevia', JSON.stringify(datos));

    // mostrar género seleccionado y cantidad de recomendaciones
    mostrarSeleccion(datos);

    //PASO 3: Filtrar libros por el género seleccionado
    const libros = catalogoLibros.filter(libro => libro.genero === genero);
        
    // PASO 4: Determinar los libros que se recomendarán y mostrar una img del libro y los datos 
    // const resultados = document.getElementById("resultados");
    const recs = obtenerRecomendaciones(cantRecs, libros);
    //guardar recomendaciones en session storage
    sessionStorage.setItem('recomendacionesPrevias', JSON.stringify(recs));

    mostrarRecomendaciones(recs);
});

//  Event handler para el botón "Limpiar"
const btnBorrarRecs = document.getElementById("btnBorrarRecs");
btnBorrarRecs.addEventListener("click", (e) => {
    limpiarSeleccion();
    limpiarResultados();

    //limpiar session storage
    sessionStorage.removeItem('recomendacionesPrevias');
    sessionStorage.removeItem('usuarioPrevio');
});

//  Event handler para el nombre de usuario
const usuarioTxt = document.getElementById("usuarioTxt");
usuarioTxt.addEventListener("input", (e) => {
    if (!e.currentTarget.value) {
        const errorUsuario = document.getElementById("errorUsuario");
        errorUsuario.textContent = "Por favor introduce tu nombre";
    } else {
        errorUsuario.textContent = "";
    }
});

//  FUNCIONES
function obtenerRecomendaciones(cantidad, catalogo) {
    // bucle para obtener los libros recomendados aleatoriamente
    const recomendaciones = [];
    do {
        let libro = catalogo[obtenerIndexAleatorio()];
        //evitar incluir el mismo libro varias veces
        if (!recomendaciones.includes(libro)) {
            recomendaciones.push(libro);
        }
    } while (recomendaciones.length < cantidad);
    return recomendaciones;
}

function obtenerIndexAleatorio() {
    //al usar floor, no incluimos el máximo en el resultado
    return Math.floor(Math.random() * 5);
}

function limpiarSeleccion() {
    //limpiar contenido y esconder elementos
    const element = document.getElementById('seleccion');
    element.innerHTML = "";
    element.hidden = true;

    const errorUsuario = document.getElementById("errorUsuario");
    errorUsuario.textContent = "";
}

function limpiarResultados() {
    const element = document.getElementById('resultados');
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function mostrarSeleccion(datos, sesionPrevia = false) {
    const seleccionDiv = document.getElementById('seleccion');
    const palabra = datos.cantidad > 1 ? "recomendaciones" : "recomendación";
    seleccionDiv.hidden = false;
    seleccionDiv.innerHTML = sesionPrevia ? `<p>Bienvenid@ de vuelta <span class="enfasis">${datos.usuario}</span>, esta fue tu selección anterior: <span class="enfasis">${datos.cantidad}</span> ${palabra} del género <span class="enfasis">"${datos.genero}"</span>:</p>` :
    `<p>Hola <span class="enfasis">${datos.usuario}</span>, te mostramos <span class="enfasis">${datos.cantidad}</span> ${palabra} del género <span class="enfasis">"${datos.genero}"</span>:</p>`;
}

function mostrarRecomendaciones(recs) {
    const resultados = document.getElementById("resultados");
    recs.forEach(libro => {
        const libroDiv = document.createElement("div");
        libroDiv.classList.add("libro");

        //agregar imagen para libro y distintos elementos para los datos
        libroDiv.appendChild(crearTexto("titulo", libro.nombre));
        libroDiv.appendChild(crearTexto("autor", libro.autor));
        libroDiv.appendChild(crearPortada(libro.src, libro.nombre));
        libroDiv.appendChild(crearTexto("ratingText", `${libro.calificacion} estrellas`));
        libroDiv.appendChild(crearLink(libro.url));
        libroDiv.appendChild(crearBotonWishlist(libro.id));

        resultados.appendChild(libroDiv);
        console.log(document.getElementById(`btn_${libro.id}`).dataset.idLibro);
    });
}

function crearBotonWishlist(id) {
    const div = document.createElement("div");
    div.innerHTML = `<button id="btn_${id}" data-id-libro="${id}">Agregar a Lista de Deseos</button>`;
    return div;
}

function crearPortada(src, titulo) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = titulo;
    return img;
}

function crearLink(url) {
    const elem = document.createElement("a");
    elem.href = url;
    elem.classList.add("url");
    elem.text = "Link";
    return elem;
}

function crearTexto(clase, valor) {
    const elem = document.createElement("p");
    elem.classList.add(clase);
    elem.textContent = valor;
    return elem;
}