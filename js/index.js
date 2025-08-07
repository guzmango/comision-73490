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

// DOM locators
const userNameInput = document.getElementById("user-name-input");
const userSaveButton = document.getElementById('user-save-button');
const userDeleteButton = document.getElementById("user-delete-button");
const userNameLabel = document.getElementById("user-name-label");
const wishlistDeleteButton = document.querySelector('#wishlist-delete-button');


//Verificar si existe usuario en local storage al cargar la página
//Si existe el usuario, mostrar nombre en la sección Lista de Deseos 
//y deshabilitar boton "Guardar Usuario"
const username = localStorage.getItem('usuario');
if (username) {
    userNameLabel.textContent = username;
    userNameInput.readOnly = true;
    userSaveButton.disabled = true;
} else {
    userNameLabel.textContent = "Invitado";
    userNameInput.readOnly = false;
    userSaveButton.disabled = false;
}

//Verificar si existe una lista de deseos en local storage para mostrarla
const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
displayWishlist(wishlist);

//Verificar si existen recomendaciones guardadas en session storage al cargar la página
const seleccionPrevia = JSON.parse(sessionStorage.getItem('seleccionPrevia')) || {};
const recomendacionesPrevias = JSON.parse(sessionStorage.getItem("recomendacionesPrevias")) || [];
if (seleccionPrevia && recomendacionesPrevias.length > 0) {
    //mostrar recomendaciones generadas previamente
    displaySelectedOptions(seleccionPrevia, true);
    displayBookSuggestions(recomendacionesPrevias);
} else {
    //establecer estado default
    clearSelectedOptions();
}

//Deshabilitar botones agregar a wishlist si el libro ya existe en la lista de deseos
//o si no existe un usuario guardado
document.querySelectorAll('.btn-wish').forEach(boton => {
    boton.disabled = wishlist.includes(boton.dataset.idLibro) || !username;
});

//  Save User Event handler
userSaveButton.addEventListener('click', function() {
    const userForm = document.querySelector("#user-form");
    if (!userForm.checkValidity()) {
        userForm.classList.add('was-validated');
    } else {
        //guardar nombre de usuario en local storage para conservarlo aún después de cerrar el navegador
        const usuario = userNameInput.value;

        localStorage.setItem('usuario', usuario);
        userNameLabel.textContent = usuario;

        //limpiar campos
        userNameInput.readOnly = true;
        userSaveButton.disabled = true;

        //habilitar botones "Agregar a la lista de deseos"
        document.querySelectorAll('.btn-wish').forEach(button => {
            button.disabled = false;
        });
    }
});

// Delete User event handler
userDeleteButton.addEventListener("click", (e) => {
    localStorage.removeItem('usuario');
    userNameLabel.textContent = "Invitado";
    userNameInput.value = "";
    userNameInput.readOnly = false;
    userSaveButton.disabled = false;
    limpiarWishlist();

    document.querySelectorAll('.btn-wish').forEach(button => {
        button.disabled = true;
    });
});

wishlistDeleteButton.addEventListener("click", (e) => {
    limpiarWishlist();
});

//  Event handler para el formulario
document.querySelector("#suggestions-options-form").addEventListener("submit", (e) => {
    //evitar que la pagina se refresque
    e.preventDefault();

    //limpiar sección de recomendaciones
    clearBookSuggestions();

    //obtener género seleccionado
    const suggestionsGenreSelect = document.querySelector("#suggestions-genre-select");
    const genre = suggestionsGenreSelect.value;
    const genreText = suggestionsGenreSelect.options[suggestionsGenreSelect.selectedIndex].label;
    
    //obtener cantidad de recomendaciones
    const qty = parseInt(document.getElementById("suggestions-qty-input").value);

    //guardar selección actual en session storage
    let currentSelection = { genero: genreText, cantidad: qty };
    sessionStorage.setItem('seleccionPrevia', JSON.stringify(currentSelection));

    // mostrar género seleccionado y cantidad de recomendaciones
    displaySelectedOptions(currentSelection);

    // Filtrar libros por el género seleccionado
    const booksByGenre = catalogoLibros.filter(book => book.genero === genre);
        
    // Determinar los libros que se recomendarán y mostrar una img del libro y los datos 
    const bookSuggestions = getBookSuggestions(qty, booksByGenre);
    //guardar recomendaciones en session storage
    sessionStorage.setItem('recomendacionesPrevias', JSON.stringify(bookSuggestions));

    displayBookSuggestions(bookSuggestions);
});

//  Event handler para el botón "Limpiar" recomendaciones
document.getElementById("suggestions-delete-button").addEventListener("click", (e) => {
    clearSelectedOptions();
    clearBookSuggestions();

    //limpiar session storage
    sessionStorage.removeItem('recomendacionesPrevias');
});

//  FUNCTIONS
function getBookSuggestions(cantidad, catalogo) {
    // bucle para obtener los libros recomendados aleatoriamente
    const recomendaciones = [];
    do {
        let libro = catalogo[getRandomIndex()];
        //evitar incluir el mismo libro varias veces
        if (!recomendaciones.includes(libro)) {
            recomendaciones.push(libro);
        }
    } while (recomendaciones.length < cantidad);
    return recomendaciones;
}

function getRandomIndex() {
    //al usar floor, no incluimos el máximo en el resultado
    return Math.floor(Math.random() * 5);
}

function clearSelectedOptions() {
    //limpiar contenido y esconder elementos
    const element = document.getElementById('selected-options-content');
    element.innerHTML = "";
    element.hidden = true;
}

function clearBookSuggestions() {
    const element = document.getElementById('suggestions-content');
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function displaySelectedOptions(datos, sesionPrevia = false) {
    const seleccionDiv = document.getElementById('selected-options-content');
    const palabra = datos.cantidad > 1 ? "recomendaciones" : "recomendación";
    seleccionDiv.hidden = false;
    seleccionDiv.innerHTML = "";

    if (sesionPrevia) {
        seleccionDiv.innerHTML = `
        <div class="alert alert-primary d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
            <div>
                Esta fue tu selección anterior: <span class="fw-bold">${datos.cantidad}</span> ${palabra} del género <span class="fw-bold">"${datos.genero}"</span>
            </div>
        </div>
        `;
    } else {
        seleccionDiv.innerHTML = `
        <div class="alert alert-success d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>
            <div>
                Te mostramos <span class="fw-bold">${datos.cantidad}</span> ${palabra} del género <span class="fw-bold">"${datos.genero}"</span>
            </div>
        </div>
        `;
    }
}

function displayBookSuggestions(recs) {
    const suggestionsContent = document.getElementById("suggestions-content");
    recs.forEach(libro => {
        const bookCard = document.createElement("div");
        bookCard.className = "col";
        bookCard.innerHTML = `
            <div class="card text-center pt-2 pb-2">
                <img src="${libro.src}" class="card-img-top" alt="${libro.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${libro.nombre}</h5>
                    <h6 class="card-subtitle mb-2 text-muted text-capitalize fw-light">${libro.autor}</h6>
                    <a href="${libro.url}" class="card-link d-block mb-2 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"><small><i class="bi bi-share me-1"></i>Link</small></a>
                    <p class="card-text">${libro.calificacion} <i class="bi bi-star"></i></p>
                    <button id="btn_wish_${libro.id}" class="btn-wish btn btn-outline-secondary btn-sm" data-id-libro="${libro.id}" type="button"><i class="bi bi-heart-fill"></i> Add to Wishlist</button>
                </div>
            </div>
        `;
        suggestionsContent.appendChild(bookCard);

        //add event listener to wishlist button
        const btnWishlist = document.getElementById(`btn_wish_${libro.id}`);
        btnWishlist.addEventListener("click", addBookToWishlist);
    });
}

function addBookToWishlist(e) {
    const idLibro = e.currentTarget.dataset.idLibro;
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!wishlist.includes(idLibro)) {
        //agregar libro por id en array solo si no existe previamente
        wishlist.push(idLibro);
        //guardar array actualizado en localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        displayWishlist(wishlist);
    }
    //deshabilitar boton
    e.currentTarget.disabled = true;
}

function displayWishlist(wishlist = []) {
    const wishlistDiv = document.querySelector("#wishlist");

    if (wishlist.length === 0) {
        wishlistDiv.innerHTML = "Aún no tienes libros guardados en tu Lista de Deseos";
    } else {
        wishlistDiv.innerHTML = "";
        wishlist.forEach(item => {
            const libro = catalogoLibros.find(l => l.id === item);
            //obtener nombre del género
            let genre = [...document.querySelector("#suggestions-genre-select").options].find(opt => opt.value === libro.genero);

            const card = document.createElement('div');
            card.classList.add('card', 'mb-3'); 
            card.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-3 pb-2 ps-2">
                        <img src="${libro.src}" class="img-fluid rounded-start" alt="${libro.nombre}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body text-start">
                            <h5 class="card-title text-start">${libro.nombre}</h5>
                            <p class="card-text"><small class="text-muted">${libro.autor}</small></p>
                            <span class="badge bg-dark">${genre.label}</span>
                            <button class="btn btn-light btn-sm"><i class="bi bi-trash3"></i></button>
                        </div>
                    </div>
                </div>
            `;
            wishlistDiv.appendChild(card);

            //TODO: add event handler to delete item button
            // const btnDeleteBook = document.getElementById("")
        });
    }
}

function limpiarWishlist() {
    //borrar wishlist del local storage
    localStorage.removeItem('wishlist');
    //remover elementos del DOM
    displayWishlist();
    //habilitar botones "Agregar a lista de deseos"
    document.querySelectorAll('.btn-wish').forEach(boton => {
        boton.disabled = !username;
    });
}