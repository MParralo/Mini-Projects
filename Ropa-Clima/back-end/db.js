require('dotenv').config(); // Para acceder a .env y que lo pueda leer
const { Pool } = require('pg'); // Para coger solo a Pool que es la que se va a comuncicar con la base datos


const conexionDb = new Pool ({ // Establezco conexión con env
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,          // Información del .env, usando instancia de Pool
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
})

conexionDb.query('SELECT NOW()') // Query es un método que envia una consulta a SQL, y se indica que consulta
    .then(() => {
        console.log("Conexión a PostgreSQL establecida correctamente.")
    })
    .catch(error => {
        console.error("Error al conectar a la base de datos:", error.message)
    })

module.exports = { // Exportamos la función 'query' para que server.js pueda hacer consultas
    query: (text, params) => conexionDb.query(text, params),
};