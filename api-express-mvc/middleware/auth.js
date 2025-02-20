const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Library = require('../models/Library'); // Para MySQL
const { MongoClient } = require('mongodb');
const mongoConfig = require('../config/mongo.config');
// Clave secreta para firmar los tokens
const SECRET_KEY = process.env.JWT_SECRET || "1234";
// Definir conexión a MongoDB si se usa
const USE_MONGO = process.env.USE_MONGO === "true";
let dbClient = null;
if (USE_MONGO) {
    dbClient = new MongoClient(mongoConfig.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}
/**
 * Función para verificar usuario y generar token JWT
 */
const generateToken = async (username, password) => {
    try {
        let db;
        if (USE_MONGO) {
            if (!dbClient.topology || !dbClient.topology.isConnected()) {
                await dbClient.connect();
            }
            db = dbClient.db('library_db').collection('users');
        } else {
            db = new Library();
        }
        //  Agregar esta línea para depurar
        console.log(" Buscando usuario en la base de datos:", username);
        let user;
        if (USE_MONGO) {
            user = await db.findOne({ username }); //  Aquí puede estar el problema
        } else {
            const users = await db.connection.query("SELECT * FROM users WHERE username = ?", [username]);
            user = users[0][0]; // Para MySQL
        }

        // 🔹 Mostrar lo que devuelve la base de datos
        console.log(" Usuario encontrado en BD:", user);

        if (!user) {
            return { error: "Usuario no encontrado" };
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { error: "Contraseña incorrecta" };
        }

        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        return { token };
    } catch (error) {
        console.error(" Error en autenticación:", error);
        return { error: "Error interno del servidor" };
    }
};


/**
 * Middleware para verificar autenticación con JWT
 */
const jwtAuth = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { generateToken, jwtAuth };
