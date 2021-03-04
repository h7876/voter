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
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('incoming data', msg)
  });
  socket.on('join', (roomcode, name)=> {
    socket.join(roomcode)
    socket.to(roomcode).emit('name', name);
  })
  socket.on('chat message', (msg) => {
    socket.emit('incoming data', msg)
  });
  socket.on('delete data', () => {
    socket.broadcast.emit('delete data')
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3131, () => {
  console.log('listening on *:3131');
});