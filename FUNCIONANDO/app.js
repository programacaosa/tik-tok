const express = require('express');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const upload = multer({ dest: 'uploads/' });
let videos = require('./videos.json');

// Serve a pasta 'uploads' para os vídeos
app.use(express.static('uploads'));

// Serve a pasta raiz para arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para carregar vídeos
app.get('/videos', (req, res) => {
  res.json(videos);
});

// Rota para upload de vídeo
app.post('/upload', upload.single('video'), (req, res) => {
  const videoData = {
    user: req.body.user,
    videoPath: `uploads/${req.file.filename}`,
    description: req.body.description,
    comments: [],
    likes: 0
  };

  videos.push(videoData);
  fs.writeFileSync('./videos.json', JSON.stringify(videos, null, 2));

  res.send('Vídeo enviado com sucesso!');
});

// Comunicação em tempo real para comentários
io.on('connection', (socket) => {
  console.log('Usuário conectado');

  socket.on('newComment', (data) => {
    const video = videos.find(v => v.videoPath === data.videoPath);
    video.comments.push(data.comment);
    fs.writeFileSync('./videos.json', JSON.stringify(videos, null, 2));

    io.emit('commentPosted', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// Inicia o servidor
server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
