// Importamos Express para manejar las rutas
const express = require('express');

// Importamos el controlador de libros, que contiene la lógica para manejar las peticiones
const books = require('../controllers/books');

const { generateToken, jwtAuth } = require('../middleware/auth');

// Creamos un router de Express para definir las rutas de la API
const router = express.Router();

// Definimos las rutas CRUD para los libros
router.get('/api/books', books.getBooks);      // Obtener todos los libros
router.post('/api/books', books.createBook);   // Crear un nuevo libro
router.put('/api/books', books.updateBook);    // Actualizar un libro existente
router.delete('/api/books', books.deleteBook); // Eliminar un libro

// Ruta de autenticación (Login)
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await generateToken(username, password);
    if (result.error) {
        return res.status(401).json({ error: result.error });
    }
    res.json(result);
});

module.exports = router;
