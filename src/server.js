import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Puedes cambiarlo luego a tu dominio real: "https://www.clustershub.pe"
    methods: ["GET", "POST"]
  }
});

// 🟢 Cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join', (codigoUsuario) => {
    socket.join(codigoUsuario);
    console.log(`Usuario ${codigoUsuario} se unió a su sala`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// 🟢 Endpoint que CodeIgniter puede usar para emitir un mensaje
app.post('/emit', (req, res) => {
  const { cod_receptor, mensaje } = req.body;
  if (!cod_receptor || !mensaje) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  let mensajeData;
  try {
    mensajeData = req.body;
  } catch (err) {
    console.error('Error al parsear mensaje:', err);
    mensajeData = { mensaje: mensaje };
  }

  io.to(cod_receptor).emit('nuevo_mensaje', mensajeData);
  console.log(`Mensaje emitido a ${cod_receptor}`);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor Socket.IO corriendo en el puerto ${PORT}`);
});
