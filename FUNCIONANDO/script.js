const socket = io();

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const formData = new FormData(this);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    alert('Vídeo enviado com sucesso!');
  }
});

// Enviar comentário
document.getElementById('sendComment').addEventListener('click', () => {
  const comment = document.getElementById('commentInput').value;
  const videoPath = 'uploads/video1.mp4'; // Exemplo, pode ser dinâmico

  socket.emit('newComment', { videoPath, comment });
});

// Atualizar a lista de comentários em tempo real
socket.on('commentPosted', (data) => {
  const commentsList = document.getElementById('commentsList');
  const li = document.createElement('li');
  li.textContent = data.comment;
  commentsList.appendChild(li);
});
