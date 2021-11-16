const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
require('dotenv').config();
const {
  CONNECTION_STRING
} = process.env;
const massive = require('massive')
const bodyParser = require('body-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(bodyParser.json());
app.use(bodyParser.text());

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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

//API
//get people in a room
app.get('/api/room/getPeople/:roomid', (req, res) => {
  const dbInstance = req.app.get('db');
  const roomid = req.params.roomid
  dbInstance.getPeopleInRoom([roomid])
  .then(people => {res.status(200).send(people);
      console.log(people);
 }).catch(err => {
  console.log(err);
  res.status(500).send(err)
});
})

//Add person to a room TEMP
app.post('/api/room/addPerson', (req, res)=> {
  console.log(req)
  let {personalId, roomid, name} = req.body;
  req.app.get('db').addPersonToRoom([personalId, roomid, name]).then(ok=> {
      res.sendStatus(200);
  }).catch(err=> {
      console.log(err)
      res.status(500).send(err)
  })
})

//remove person from room TEMP
app.delete('/api/room/removePerson', (req, res)=> {
  console.log(req)
  let {personalId, roomid} = req.body;
  req.app.get('db').deletePersonFromRoom([personalId, roomid]).then(ok=> {
      res.sendStatus(200);
  }).catch(err=> {
      console.log(err)
      res.status(500).send(err)
  })
})

http.listen(3131, () => {
  console.log('listening on *:3131');
});

massive(CONNECTION_STRING).then((db)=> {
  db.reload().then((db)=> {app.set('db', db)})
  console.log('DB Connected!')
  
}).catch((error)=> console.log(error));

// app.listen(3131, ()=> {
//   console.log(`Things are happening on port: ${3131}`)
// });