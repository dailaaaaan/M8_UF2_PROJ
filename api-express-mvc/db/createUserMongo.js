const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// URI de conexión a MongoDB Atlas (cambia esto con tu conexión real)
const mongoUri = "mongodb+srv://dylan:1234@cluster0.3eldj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(mongoUri);

async function createUser() {
    try {
        await client.connect();
        const db = client.db('library_db').collection('users');

        const username = "admin";
        const password = "1234"; // Será cifrada antes de guardarla

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insertOne({ username, password: hashedPassword });
        console.log("✅ Usuario creado con éxito en MongoDB");
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
    } finally {
        client.close();
    }
}

createUser();
