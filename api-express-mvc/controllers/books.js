// Importamos el modelo `Library` que maneja la base de datos MySQL.
const Library = require('../models/Library'); 

// Importamos `MongoClient` para conectar con MongoDB y `ObjectId` para manejar identificadores de MongoDB.
const { MongoClient, ObjectId } = require('mongodb'); 

// Importamos la configuración de MySQL y MongoDB desde sus respectivos archivos.
const mysqlConfig = require('../config/mysql.config');
const mongoConfig = require('../config/mongo.config');

// Definimos una variable `USE_MONGO` para determinar si se usará MongoDB o MySQL. 
// Se basa en una variable de entorno (si `USE_MONGO="true"`, se usa MongoDB).
const USE_MONGO = process.env.USE_MONGO === "true";

// Definimos la variable `dbClient` que se usará para conectar a MongoDB.
let dbClient = null;

// Si la aplicación está configurada para usar MongoDB, inicializamos `dbClient` con la URI de conexión.
if (USE_MONGO) {
    dbClient = new MongoClient(mongoConfig.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

/**
 * Obtiene la colección de libros desde la base de datos.
 * Dependiendo de `USE_MONGO`, conecta con MongoDB o usa el modelo MySQL.
 * 
 * @returns {Object} Colección de libros de MongoDB o instancia de `Library` para MySQL.
 */
async function getDbCollection() {
    if (USE_MONGO) {
        // Si la conexión con MongoDB no está establecida, la establecemos antes de continuar.
        if (!dbClient.topology || !dbClient.topology.isConnected()) {
            await dbClient.connect();
        }
        // Devolvemos la colección "books" dentro de la base de datos "library_db".
        return dbClient.db('library_db').collection('books');
    }
    // Si no usamos MongoDB, devolvemos la instancia del modelo MySQL.
    return new Library();
}

/**
 * Obtiene todos los libros de la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const getBooks = async (req, res) => {
    try {
        let db = await getDbCollection();
        
        // Si usamos MongoDB, usamos `find({})` para obtener todos los libros y los convertimos en un array.
        // Si usamos MySQL, llamamos a `listAll()`.
        let books = USE_MONGO ? await db.find({}).toArray() : await db.listAll();
        
        // Enviamos la lista de libros como respuesta JSON.
        res.json(books);
    } catch (error) {
        // Si ocurre un error, enviamos un mensaje de error con código 500 (Error interno del servidor).
        res.status(500).json({ error: "Error getting books..." });
    }
};

/**
 * Crea un nuevo libro en la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los datos del libro en `req.body`.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const createBook = async (req, res) => {
    try {
        let db = await getDbCollection();

        // Creamos un objeto con los datos recibidos en `req.body`.
        const newBook = {
            title: req.body.title,
            author: req.body.author,
            year: req.body.year
        };

        // Si usamos MongoDB, insertamos el libro en la colección.
        // Si usamos MySQL, usamos `create()`.
        let created = USE_MONGO ? await db.insertOne(newBook) : await db.create(newBook);
        
        // Enviamos una respuesta indicando si la creación fue exitosa.
        res.json(created ? "Book created successfully" : "Error creating book...");
    } catch (error) {
        // Enviamos un error si algo falla.
        res.status(500).json({ error: "Error creating book..." });
    }
};
/**
 * Actualiza un libro existente en la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados en `req.body`.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const updateBook = async (req, res) => {
    try {
        let db = await getDbCollection();
        // Creamos un objeto con los datos actualizados.
        const updatedBook = {
            title: req.body.title,
            author: req.body.author,
            year: req.body.year
        };

        // Si usamos MongoDB, usamos `updateOne()` para actualizar el libro con `_id`.
        // Si usamos MySQL, llamamos a `update()`.
        let updated = USE_MONGO 
            ? await db.updateOne({ _id: new ObjectId(req.body.id) }, { $set: updatedBook })
            : await db.update(updatedBook);

        // Comprobamos si se realizaron modificaciones antes de enviar la respuesta.
        res.json(updated.modifiedCount > 0 ? "Book updated successfully" : "Error updating book...");
    } catch (error) {
        // Enviamos un error si algo falla.
        res.status(500).json({ error: "Error updating book..." });
    }
};
/**
 * Elimina un libro de la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con el ID del libro a eliminar en `req.body.id`.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const deleteBook = async (req, res) => {
    try {
        let db = await getDbCollection();

        // Si usamos MongoDB, eliminamos el libro con `_id`.
        // Si usamos MySQL, eliminamos el libro con su ID numérico.
        let deleted = USE_MONGO 
            ? await db.deleteOne({ _id: new ObjectId(req.body.id) }) 
            : await db.delete(req.body.id);

        // Comprobamos si se eliminó correctamente antes de enviar la respuesta.
        res.json(deleted.deletedCount > 0 ? "Book deleted successfully" : "Error deleting book...");
    } catch (error) {
        // Enviamos un error si algo falla.
        res.status(500).json({ error: "Error deleting book..." });
    }
};
// Exportamos las funciones para que puedan ser utilizadas en otros archivos.
module.exports = {
    getBooks,    // Función para obtener todos los libros
    createBook,  // Función para crear un nuevo libro
    updateBook,  // Función para actualizar un libro
    deleteBook   // Función para eliminar un libro
};
