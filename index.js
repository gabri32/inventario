import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import https from 'https';
import express from 'express';
import sequelize from './db/database.js';
import { fileURLToPath } from 'url';
import path from 'path';
import estadosRoutes from './routes/estados.routes.js';
import authRoutes from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
var corsOptions = {
  origin: 'https://inventariou.netlify.app',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/estados', estadosRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

// Auto-ping cada 12 minutos (720000 ms)
// setInterval(() => {
//   https.get("https://uniforce.onrender.com", (res) => {
//     console.log(`Ping enviado, status code: ${res.statusCode}`);
//   }).on("error", (err) => {
//     console.error("Error en auto-ping:", err.message);
//   });
// }, 720000);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada');

    app.listen(PORT, () => {
      console.log(`Servidor en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar la base de datos:', error.message);
    process.exit(1);
  }
};

startServer();
