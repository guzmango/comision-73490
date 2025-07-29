/*
    Simulador de Recomendaciones de Libros

    El usuario puede seleccionar el género literario y cuántos libros quiere que se le recomienden (de 1 a 5 libros aleatorios).
    Al presionar el botón "Obtener Recomendaciones" se mostrará una lista de libros pertenecientes al género seleccionado.
    Dichas recomendaciones se guardan en session storage, para borrarse una vez que se cierra el navegador.
    El botón "Limpiar" elimina las recomendaciones del session storage.

    También es posible guardar un nombre de usuario para poder agregar libros recomendados a la lista de deseos.
    Tanto el nombre de usuario como la lista de deseos se guardan en local storage.
    El botón "Limpiar Wishlist" borra la lista de deseos del local storage.
    El botón "Borrar Usuario" elimina tanto el nombre de usuario como la lista de deseos del local storage.
*/

const usuarioTxt = document.querySelector("#usuarioTxt");
usuarioTxt.addEventListener("input", (e) => {
    const errorUsuario = document.getElementById("errorUsuario");
    if (!e.currentTarget.value) {
        errorUsuario.textContent = "Por favor introduce tu nombre";
        btnGuardarUsuario.disabled = true;
    } else {
        errorUsuario.textContent = "";
        btnGuardarUsuario.disabled = false;
    }
});

//Verificar si existe usuario en local storage al cargar la página
//Si existe el usuario, mostrar nombre en la sección Lista de Deseos 
//y deshabilitar boton "Guardar Usuario"
const nombreUsuario = localStorage.getItem('usuario');
const lblNombreUsuario = document.querySelector("#lblNombreUsuario");
if (nombreUsuario) {
    lblNombreUsuario.textContent = nombreUsuario;
    usuarioTxt.disabled = true;
} else {
    lblNombreUsuario.textContent = "Invitado";
    usuarioTxt.disabled = false;
}

//Verificar si existe una lista de deseos en local storage para mostrarla
const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
dibujarWishlist(wishlist);

//Verificar si existen recomendaciones guardadas en session storage al cargar la página
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

//Deshabilitar botones agregar a wishlist si el libro ya existe en la lista de deseos
//o si no existe un usuario guardado
document.querySelectorAll('.btn-wish').forEach(boton => {
    boton.disabled = wishlist.includes(boton.dataset.idLibro) || !nombreUsuario;
});

//  Event handler para guardar el nombre de usuario
const btnGuardarUsuario = document.getElementById("btnGuardarUsuario");
btnGuardarUsuario.addEventListener("click", (e) => {
    //guardar nombre de usuario en local storage para conservarlo aún después de cerrar el navegador
    // const usuarioTxt = document.getElementById("usuarioTxt");
    const usuario = usuarioTxt.value;

    localStorage.setItem('usuario', usuario);
    document.getElementById("lblNombreUsuario").textContent = usuario;

    //limpiar campos
    btnGuardarUsuario.disabled = true;
    usuarioTxt.value = "";
    usuarioTxt.disabled = true;

    //habilitar botones "Agregar a la lista de deseos"
    document.querySelectorAll('.btn-wish').forEach(boton => {
        boton.disabled = false;
    });
});

//  Event handler para borrar el nombre de usuario
document.getElementById("btnBorrarUsuario").addEventListener("click", (e) => {
    localStorage.removeItem('usuario');
    document.getElementById("lblNombreUsuario").textContent = "Invitado";
    usuarioTxt.disabled = false;
    limpiarWishlist();

    document.querySelectorAll('.btn-wish').forEach(boton => {
        boton.disabled = true;
    });
});

//  Event handler para el formulario
document.querySelector("#datosUsuario").addEventListener("submit", (e) => {
    //evitar que la pagina se refresque
    e.preventDefault();

    //limpiar sección de resultados
    limpiarResultados();

    //obtener género seleccionado
    const generoList = document.querySelector("#generoList");
    const genero = generoList.value;
    const generoText = generoList.options[generoList.selectedIndex].label;
    
    //obtener cantidad de recomendaciones
    const cantRecs = parseInt(document.getElementById("numRecsTxt").value);

    //guardar selección actual en session storage
    let datos = { genero: generoText, cantidad: cantRecs };
    sessionStorage.setItem('seleccionPrevia', JSON.stringify(datos));

    // mostrar género seleccionado y cantidad de recomendaciones
    mostrarSeleccion(datos);

    // Filtrar libros por el género seleccionado
    const libros = catalogoLibros.filter(libro => libro.genero === genero);
        
    // Determinar los libros que se recomendarán y mostrar una img del libro y los datos 
    const recs = obtenerRecomendaciones(cantRecs, libros);
    //guardar recomendaciones en session storage
    sessionStorage.setItem('recomendacionesPrevias', JSON.stringify(recs));

    mostrarRecomendaciones(recs);
});

//  Event handler para el botón "Limpiar" recomendaciones
document.getElementById("btnBorrarRecs").addEventListener("click", (e) => {
    limpiarSeleccion();
    limpiarResultados();

    //limpiar session storage
    sessionStorage.removeItem('recomendacionesPrevias');
});

document.querySelector('#btnLimpiarWishlist').addEventListener("click", (e) => {
    limpiarWishlist();
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
    seleccionDiv.innerHTML = sesionPrevia ? `<p>Esta fue tu selección anterior: <span class="enfasis">${datos.cantidad}</span> ${palabra} del género <span class="enfasis">"${datos.genero}"</span>:</p>` :
    `<p>Te mostramos <span class="enfasis">${datos.cantidad}</span> ${palabra} del género <span class="enfasis">"${datos.genero}"</span>:</p>`;
}

function mostrarRecomendaciones(recs) {
    const resultados = document.getElementById("resultados");
    recs.forEach(libro => {
        const libroDiv = document.createElement("div");
        libroDiv.className = "libro";

        //agregar imagen para libro y distintos elementos para los datos
        libroDiv.appendChild(crearTexto("titulo", libro.nombre));
        libroDiv.appendChild(crearTexto("autor", libro.autor));
        libroDiv.appendChild(crearPortada(libro.src, libro.nombre));
        libroDiv.appendChild(crearTexto("ratingText", `${libro.calificacion} estrellas`));
        libroDiv.appendChild(crearLink(libro.url));
        libroDiv.appendChild(crearBotonWishlist(libro));

        resultados.appendChild(libroDiv);
    });
}

function crearBotonWishlist(libro) {
    const boton = document.createElement('button');
    boton.innerText = "Agregar a Lista de Deseos";
    boton.id = `btn_wish_${libro.id}`;
    boton.className = 'btn-wish';
    boton.dataset.idLibro = `${libro.id}`;
    boton.addEventListener("click", agregarLibroWishlist);

    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const nombreUsuario = localStorage.getItem('usuario');
    boton.disabled = wishlist.includes(boton.dataset.idLibro) || !nombreUsuario;
    return boton;
}

function agregarLibroWishlist(e) {
    const idLibro = e.currentTarget.dataset.idLibro;
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!wishlist.includes(idLibro)) {
        //agregar libro por id en array solo si no existe previamente
        wishlist.push(idLibro);
        //guardar array actualizado en localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        dibujarWishlist(wishlist);
    }
    //deshabilitar boton
    e.currentTarget.disabled = true;
}

function dibujarWishlist(wishlist = []) {
    const wishlistDiv = document.querySelector("#wishlist");

    if (wishlist.length === 0) {
        wishlistDiv.innerHTML = "Aún no tienes libros guardados en tu Lista de Deseos";
    } else {
        wishlistDiv.innerHTML = "";
        wishlist.forEach(item => {
            const libro = catalogoLibros.find(l => l.id === item);
            const elem = document.createElement('div');
            elem.className = 'wishlist-item';
            //obtener nombre del género
            let genero = [...document.querySelector("#generoList").options].find(opt => opt.value === libro.genero);
            elem.innerHTML = `
                <p><a href="${libro.url}"><span class="wishlist-titulo">${libro.nombre}</span></a>, <span class="wishlist-autor">${libro.autor}</span> 
                (${genero.label})</p>
            `;
            wishlistDiv.appendChild(elem);
        });
    }
}

function limpiarWishlist() {
    //borrar wishlist del local storage
    localStorage.removeItem('wishlist');
    //remover elementos del DOM
    dibujarWishlist();
    //habilitar botones "Agregar a lista de deseos"
    document.querySelectorAll('.btn-wish').forEach(boton => {
        boton.disabled = !nombreUsuario;
    });
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
    elem.className = "url";
    elem.text = "Link";
    return elem;
}

function crearTexto(clase, valor) {
    const elem = document.createElement("p");
    elem.className = clase;
    elem.textContent = valor;
    return elem;
}