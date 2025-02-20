const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Configuración de conexión a MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Asegúrate de cambiar esto si tienes contraseña en MySQL
    database: "library_db"
});

const username = "admin";
const password = "1234"; // Esta será cifrada antes de guardarla

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    
    // Inserta el usuario en la base de datos con la contraseña cifrada
    connection.query(
        "INSERT INTO users (username, password) VALUES (?, ?)", 
        [username, hash], 
        (error, results) => {
            if (error) throw error;
            console.log(" Usuario creado con éxito en MySQL");
            connection.end();
        }
    );
});
