// Importamos mysql2 para la conexión con MySQL
const mysql = require("mysql2");
// Importamos la configuración de la base de datos desde mysql.config.js
const dbConfig = require("../config/mysql.config");

// Definimos la clase Library que manejará la conexión y operaciones en MySQL
class Library {
  constructor() {
    // Configuración y conexión a MySQL
    let connection = mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB
    });

    // Establecemos la conexión y manejamos errores si ocurren
    connection.connect(error => {
      if (error) throw error;
      console.log("Successfully connected to the database.");
    });

    // Convertimos la conexión en promesa para facilitar el uso de async/await
    this.connection = connection.promise();
  }
  // Método para cerrar la conexión
  close = () => {
    this.connection.end();
  }
  // Método para obtener todos los libros de la base de datos
  listAll = async () => {
    const [results] = await this.connection.query("SELECT * FROM books");
    return results;
  }
  // Método para insertar un nuevo libro
  create = async (newBook) => {
    try {
      const [results] = await this.connection.query("INSERT INTO books SET ?", newBook);
      return results.affectedRows; // Devuelve el número de filas afectadas
    } catch (error) {
      return error;
    }
  };
  // Método para actualizar un libro existente
  update = async (updatedBook) => {
    try {
      const { id, title, author, year } = updatedBook;
      const [results] = await this.connection.query(
        "UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?",
        [title, author, year, id]
      );
      return results.affectedRows;
    } catch (error) {
      return error;
    }
  }
  // Método para eliminar un libro por su ID
  delete = async (bookId) => {
    try {
      const [results] = await this.connection.query("DELETE FROM books WHERE id = ?", [bookId]);
      return results.affectedRows;
    } catch (error) {
      return error;
    }
  }
}
// Exportamos la clase para que pueda ser utilizada en otros archivos
module.exports = Library;
