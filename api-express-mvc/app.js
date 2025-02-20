// Importamos Express para crear el servidor
const express = require('express');
// Importamos CORS para permitir peticiones desde diferentes orígenes
const cors = require('cors');
// Importamos las rutas definidas en `routes.js`
const routes = require('./routes/routes');
// Cargamos las variables de entorno desde un archivo `.env`
require('dotenv').config(); 
// Creamos una instancia de la aplicación Express
const app = express();
// Middleware: Habilitamos CORS para evitar restricciones en el navegador
app.use(cors());
// Middleware: Habilitamos el soporte para JSON en las solicitudes
app.use(express.json());
// Middleware: Asociamos las rutas definidas en `routes.js` al servidor
app.use('/', routes);
// Definimos el puerto en el que correrá el servidor (por defecto 5000)
const PORT = process.env.PORT || 5000;
// Iniciamos el servidor y mostramos un mensaje en la consola
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
