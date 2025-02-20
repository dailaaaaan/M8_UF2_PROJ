// Cuando la página carga, se ejecuta esta función
window.onload = () => {
    fetchBooks(); // Obtiene la lista de libros desde la API

    // Asigna eventos a los botones para crear libros y descargar video
    document.querySelector('#createButton').addEventListener('click', createBook);
    document.querySelector('#downloadButton').addEventListener('click', downloadVideo);
};

/**
 * Obtiene la lista de libros desde la API y actualiza la tabla
 */
async function fetchBooks() {
    let apiUrl = "http://localhost:5000/api/books";
    let res = await fetch(apiUrl);
    let books = await res.json();

    eraseTable(); // Limpia la tabla antes de actualizarla
    updateTable(books); // Inserta los nuevos datos en la tabla
}

/**
 * Elimina todas las filas de la tabla de libros
 */
function eraseTable() {
    let filas = Array.from(document.querySelectorAll('tbody tr'));
    filas.forEach(fila => fila.remove());
}

/**
 * Actualiza la tabla con los datos de los libros obtenidos de la API
 * @param {Array} books - Lista de libros
 */
function updateTable(books) {
    let table = document.getElementById("book-table");
    eraseTable(); // Asegura que la tabla está vacía antes de actualizar

    books.forEach(book => {
        let row = document.createElement('tr');
        table.append(row);

        let celdaId = document.createElement('td');
        celdaId.innerHTML = book._id ? book._id : "Sin ID"; // Usa `_id` para MongoDB
        row.append(celdaId);

        let celdaTitulo = document.createElement('td');
        celdaTitulo.innerHTML = book.title;
        celdaTitulo.contentEditable = true;
        row.append(celdaTitulo);

        let celdaAutor = document.createElement('td');
        celdaAutor.innerHTML = book.author;
        celdaAutor.contentEditable = true;
        row.append(celdaAutor);

        let celdaAno = document.createElement('td');
        celdaAno.innerHTML = book.year;
        celdaAno.contentEditable = true;
        row.append(celdaAno);

        let celdaAcciones = document.createElement('td');
        row.append(celdaAcciones);

        let buttonEdit = document.createElement('button');
        buttonEdit.innerHTML = "Modificar";
        buttonEdit.addEventListener('click', editBook);
        celdaAcciones.append(buttonEdit);

        let buttonDelete = document.createElement('button');
        buttonDelete.innerHTML = "Eliminar";
        buttonDelete.addEventListener('click', deleteBook);
        celdaAcciones.append(buttonDelete);
    });
}

/**
 * Envía una solicitud a la API para eliminar un libro
 */
async function deleteBook(event) {
    let celdas = event.target.parentElement.parentElement.children;
    let id = celdas[0].innerHTML; // Obtiene el ID del libro

    let apiUrl = "http://localhost:5000/api/books";
    let deletedBook = { "id": id };

    let response = await fetch(apiUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deletedBook)
    });

    console.log(await response.json());
    fetchBooks(); // Recarga la tabla
}

/**
 * Envía una solicitud a la API para modificar un libro
 */
async function editBook(event) {
    let celdas = event.target.parentElement.parentElement.children;
    let id = celdas[0].innerHTML;
    let titulo = celdas[1].innerHTML;
    let autor = celdas[2].innerHTML;
    let ano = celdas[3].innerHTML;

    let apiUrl = "http://localhost:5000/api/books";
    let modifiedBook = { "id": id, "title": titulo, "author": autor, "year": ano };

    let response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifiedBook)
    });

    console.log(await response.json());
    fetchBooks(); // Recarga la tabla
}

/**
 * Envía una solicitud a la API para crear un nuevo libro
 */
async function createBook() {
    let titulo = document.querySelector("#book-title").value;
    let autor = document.querySelector("#book-author").value;
    let ano = document.querySelector("#book-year").value;

    let apiUrl = "http://localhost:5000/api/books";
    let newBook = { title: titulo, author: autor, year: ano };

    let response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
    });

    console.log(await response.json());
    fetchBooks(); // Recarga la tabla
}

/**
 * Simula la descarga de un video creando un enlace de descarga temporal
 */
function downloadVideo() {
    console.log('Downloading video...');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '../video/2025-02-16_ Saludo bautismo de dilan.mp4');
    xhr.responseType = 'blob';
    xhr.send();

    xhr.onload = function () {
        if (xhr.status == 200) {
            console.log(`Done downloading video!`);
            const blob = new Blob([xhr.response], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'downloaded_video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            console.log(`Error ${xhr.status}: ${xhr.statusText}`);
        }
    };

    xhr.onerror = function () {
        console.log("Request failed");
    };
}
