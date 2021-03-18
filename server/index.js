const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join', (roomcode, name)=> {
    socket.join(roomcode)
    io.to(roomcode).emit('name', name);
  })
  socket.on('chat message', (msg, roomcode) => {
    socket.join(roomcode)
    io.to(roomcode).emit('incoming data', msg)
  });
  socket.on('delete data', () => {
    socket.broadcast.emit('delete data')
  });
  socket.on('reveal', (roomcode) => {
    socket.join(roomcode)
    io.to(roomcode).emit('reveal')
  });
  socket.on('newuser', (people, roomcode) => {
    socket.join(roomcode)
    io.to(roomcode).emit('newuser', people)
  });

});

// io.on('chat message', (socket, roomcode, msg) => {
//   socket.join(roomcode)
//   io.to(roomcode).emit('incoming data', msg)
// });
// io.on('reveal', (roomcode) => {
//   socket.join(roomcode)
//   io.to(roomcode).emit('reveal')
// });

// io.on('name', (socket, roomcode, name) => {
//   socket.join(roomcode)
//   io.to(roomcode).emit('newuser', name)
// });

// io.on('join', (socket, roomcode, name) => {
//   socket.join(roomcode)
//   io.to(roomcode).emit('incoming data', msg)
//   io.to(roomcode).emit('name', name);
// });

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3131, () => {
  console.log('listening on *:3131');
});