require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db'); // Importa la conexión a PostgreSQL

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// RUTAS DE AUTENTICACIÓN

// RUTA DE REGISTRO
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, saltRounds);
        const text = 'INSERT INTO users(username, password_hash) VALUES($1, $2)';
        const values = [username, password_hash]; 
        await db.query(text, values); 

        res.status(201).json({ message: 'Registro exitoso.' });
    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        console.error('Error en el registro:', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// RUTA DE INICIO DE SESIÓN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const text = 'SELECT id, username, password_hash FROM users WHERE username = $1';
        const result = await db.query(text, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            res.status(200).json({ 
                message: 'Inicio de sesión exitoso.', 
                user: { id: user.id, username: user.username }
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }

    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// RUTAS DE FAVORITOS

// 1. Obtener favoritos de un usuario
app.get('/api/favorites/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query('SELECT city_name FROM favorites WHERE user_id = $1', [userId]);
        // Devuelve un array simple de nombres de ciudades: ["Madrid", "Barcelona"]
        const cities = result.rows.map(row => row.city_name);
        res.json({ favorites: cities });
    } catch (error) {
        console.error('Error al obtener favoritos:', error.message);
        res.status(500).json({ message: 'Error al obtener favoritos' });
    }
});

// 2. Añadir favorito
app.post('/api/favorites', async (req, res) => {
    const { userId, cityName } = req.body;
    try {
        // ON CONFLICT DO NOTHING evita errores si intentan guardar la misma ciudad dos veces
        await db.query('INSERT INTO favorites (user_id, city_name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, cityName]);
        res.status(201).json({ message: 'Favorito añadido' });
    } catch (error) {
        console.error('Error al añadir favorito:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// 3. Eliminar favorito
app.delete('/api/favorites', async (req, res) => {
    const { userId, cityName } = req.body;
    try {
        await db.query('DELETE FROM favorites WHERE user_id = $1 AND city_name = $2', [userId, cityName]);
        res.json({ message: 'Favorito eliminado' });
    } catch (error) {
        console.error('Error al eliminar favorito:', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});