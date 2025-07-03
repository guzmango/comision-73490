//Simulador de Recomendaciones de Libros
//Objetivo: Pedir al usuario el género literario y cuántos libros quiere que se le recomienden.
//          Al final devolver una lista de libros pertenecientes al género seleccionado.
//Input del usuario: a) genero literario (darle 4 opciones: romance, terror, ciencia ficcion, comics)
//                   b) cuántas recomendaciones quiere

const maxRecs = 5;
const generos = ["romance", "terror", "ciencia ficcion", "comics"];
const catalogoLibros = [
    { genero: "romance", nombre: "The Notebook", autor: "Nicholas Sparks", calificacion: 4.16, url: "https://www.goodreads.com/book/show/33648131-the-notebook" },
    { genero: "romance", nombre: "Twilight", autor: "Stephenie Meyer", calificacion: 3.67, url: "https://www.goodreads.com/book/show/41865.Twilight" },
    { genero: "romance", nombre: "Romeo and Juliet", autor: "William Shakespeare", calificacion: 3.74, url: "https://www.goodreads.com/book/show/59926998-romeo-and-juliet" },
    { genero: "romance", nombre: "Pride and Prejudice", autor: "Jane Austen", calificacion: 4.29, url: "https://www.goodreads.com/book/show/129915654-pride-and-prejudice" },
    { genero: "romance", nombre: "A Court of Thorns and Roses", autor: "Sarah J. Maas", calificacion: 4.17, url: "https://www.goodreads.com/book/show/16096824-a-court-of-thorns-and-roses" },
    { genero: "terror", nombre: "The Shining", autor: "Stephen King", calificacion: 4.28, url: "https://www.goodreads.com/book/show/11588.The_Shining" },
    { genero: "terror", nombre: "World War Z", autor: "Max Brooks", calificacion: 4.02, url: "https://www.goodreads.com/book/show/8908.World_War_Z" },
    { genero: "terror", nombre: "Battle Royale", autor: "Koushun Takami", calificacion: 4.26, url: "https://www.goodreads.com/book/show/57891.Battle_Royale" },
    { genero: "terror", nombre: "Dracula", autor: "Bram Stoker", calificacion: 4.02, url: "https://www.goodreads.com/book/show/17245.Dracula" },
    { genero: "terror", nombre: "Frankenstein", autor: "Mary Shelley", calificacion: 3.89, url: "https://www.goodreads.com/book/show/34913533-frankenstein" },
    { genero: "ciencia ficcion", nombre: "Ender’s Game", autor: "Orson Scott Card", calificacion: 4.31, url: "https://www.goodreads.com/book/show/375802.Ender_s_Game" },
    { genero: "ciencia ficcion", nombre: "Ready Player One", autor: "Ernest Cline", calificacion: 4.23, url: "https://www.goodreads.com/book/show/9969571-ready-player-one" },
    { genero: "ciencia ficcion", nombre: "Dune", autor: "Frank Herbert", calificacion: 4.28, url: "https://www.goodreads.com/book/show/44767458-dune" },
    { genero: "ciencia ficcion", nombre: "The Martian", autor: "Andy Weir", calificacion: 4.42, url: "https://www.goodreads.com/book/show/18007564-the-martian" },
    { genero: "ciencia ficcion", nombre: "Foundation", autor: "Isaac Asimov", calificacion: 4.17, url: "https://www.goodreads.com/book/show/29579.Foundation" },
    { genero: "comics", nombre: "Batman: The Killing Joke", autor: "Alan Moore", calificacion: 4.36, url: "https://www.goodreads.com/book/show/96358.Batman" },
    { genero: "comics", nombre: "The Sandman, Vol. 1: Preludes & Nocturnes", autor: "Neil Gaiman", calificacion: 4.25, url: "https://www.goodreads.com/book/show/23754.The_Sandman_Vol_1" },
    { genero: "comics", nombre: "Watchmen", autor: "Alan Moore", calificacion: 4.39, url: "https://www.goodreads.com/book/show/472331.Watchmen" },
    { genero: "comics", nombre: "Nimona", autor: "N.D. Stevenson", calificacion: 4.18, url: "https://www.goodreads.com/book/show/19351043-nimona" },
    { genero: "comics", nombre: "Saga, Volume 1", autor: "Brian K. Vaughan", calificacion: 4.16, url: "https://www.goodreads.com/book/show/15704307-saga-volume-1" }
];

const validarGenero = function (genero) {
    let esValido = true;
    //condicional: dependiendo del género es el contenido de las recomendaciones, 
    //              si pide un género que no esta en el array, mostrar error en consola
    if (!generos.includes(genero)) {
        console.error("El género solicitado no está disponible");
        esValido = false;
    }
    return esValido;
};

// PASO 1: Pedir al usuario el género literario deseado
let genero = prompt("Cuál género literario prefieres: " + generos.join(", ") + "?");
console.log("Género seleccionado = " + genero);

// convertir genero a minúsculas para realizar la comparación
genero = genero.toLowerCase();
if (validarGenero(genero)) {    
    // PASO 2: Solicitar cuántos libros quiere que se le recomienden
    const cantRecs = parseInt(prompt("Cuántas recomendaciones quieres? (Max: 5)"));
    console.log("Recomendaciones solicitadas = " + cantRecs);

    if (validarCantidadRecomendaciones(cantRecs)) {
        //PASO 3: Filtrar libros por el género seleccionado
        const libros = catalogoLibros.filter(libro => libro.genero === genero);
        
        // PASO 4: Determinar los libros que se recomendarán y mostrarlos en consola
        obtenerRecomendaciones(cantRecs, libros);
    }
}

function obtenerRecomendaciones(cantidad, catalogo) {
    console.log("Te mostramos nuestras recomendaciones del género \"" + genero + "\": \n");
    // bucle para obtener los libros recomendados aleatoriamente
    const recomendaciones = [];
    do {
        let libro = catalogo[obtenerIndexAleatorio()];
        //evitar incluir el mismo libro varias veces
        if (!recomendaciones.includes(libro)) {
            recomendaciones.push(libro);
            console.log("* \"" + libro.nombre + "\", Autor: " + libro.autor + 
                        ". Calificación: " + libro.calificacion + " estrellas, Link: " + libro.url);
        }
    } while (recomendaciones.length < cantidad);
}

function validarCantidadRecomendaciones(cantidad) {
    let numeroEsValido = true;
    //condicional: si pide más de 5 libros, mostrar un error
    if (isNaN(cantidad) || cantidad < 1) {
        console.error("Introduce un número válido");
        numeroEsValido = false;
    } else if (cantidad > maxRecs) {
        console.error("Solo puedes pedir hasta 5 recomendaciones");
        numeroEsValido = false;
    }
    return numeroEsValido;
}

function obtenerIndexAleatorio() {
    //al usar floor, no incluimos el máximo en el resultado
    return Math.floor(Math.random() * maxRecs);
}