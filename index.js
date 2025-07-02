//Simulador de Recomendaciones de Libros
//Objetivo: Pedir al usuario el género literario y cuántos libros quiere que se le recomienden.
//          Al final devolver una lista de libros pertenecientes al género seleccionado.
//Input del usuario: a) genero literario (darle 4 opciones: romance, terror, ciencia ficcion, novelas graficas)
//                   b) cuántas recomendaciones quiere

//  VARIABLES
const maxRecs = 5;
const maxRecsError = "Solo puedes pedir hasta 5 recomendaciones";

//  ARRAYS
//  - generos disponibles
//  - 1 array por cada genero con 5 libros (objetos)
const generos = ["romance", "terror", "scifi", "comics"];
const librosRomance = [
    { nombre: "The Notebook", autor: "Nicholas Sparks", calificacion: 4.16, url: "https://www.goodreads.com/book/show/33648131-the-notebook" },
    { nombre: "Twilight", autor: "Stephenie Meyer", calificacion: 3.67, url: "https://www.goodreads.com/book/show/41865.Twilight" },
    { nombre: "Romeo and Juliet", autor: "William Shakespeare", calificacion: 3.74, url: "https://www.goodreads.com/book/show/59926998-romeo-and-juliet" },
    { nombre: "Pride and Prejudice", autor: "Jane Austen", calificacion: 4.29, url: "https://www.goodreads.com/book/show/129915654-pride-and-prejudice" },
    { nombre: "A Court of Thorns and Roses", autor: "Sarah J. Maas", calificacion: 4.17, url: "https://www.goodreads.com/book/show/16096824-a-court-of-thorns-and-roses" }
];
const librosTerror = [
    { nombre: "The Shining", autor: "Stephen King"},
    { nombre: "World War Z", autor: "Max Brooks" }
];

const numRecs = parseInt(prompt("Cuántas recomendaciones quieres? (Max: 5)"));
console.log("Recomendaciones solicitadas = " + numRecs);

//  FUNCIONES
const validarNumRecomendaciones = function (numRec) {
    let numeroEsValido = true;
    if (isNaN(numRecs)) {
        console.error("Introduce un número válido");
        numeroEsValido = false;
    } else if (numRecs > maxRecs) {
        alert(maxRecsError);
        console.error(maxRecsError);
        numeroEsValido = false;
    }
    return numeroEsValido;
}

console.log("Terror: " + JSON.stringify(librosTerror));
console.log("Romance: " + JSON.stringify(librosRomance));

if (validarNumRecomendaciones(numRecs)) {
    let genero = prompt("Cuál género literario prefieres: " + generos + "?");
    console.log("Género seleccionado = " + genero);
    if (!generos.includes(genero)) {
        console.error("El género solicitado no está disponible");
    }

    

    // console.log(obtenerLibroAleatorio(maxRecs));
    // console.log(obtenerLibroAleatorio(maxRecs));
    // console.log(obtenerLibroAleatorio(maxRecs));
}

//condicional: dependiendo del genero es el contenido de las recomendaciones, 
//              si pide mas de 3 libros mostrar un error
//              si pide un genero que no esta en el array, mostrar error

//ciclo iteracion: para obtener libros del array de acuerdo al genero (el index se obtiene con random)


function obtenerLibroAleatorio(index) {
    //al usar floor, no incluimos index en el resultado
    return Math.floor(Math.random() * index);
};