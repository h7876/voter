const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
//Start Redis
const {createAdapter}  = require('@socket.io/redis-adapter');
const {createClient} = require ('redis');

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  io.listen(3131);
});
//End Redis

require('dotenv').config();
const {
  CONNECTION_STRING
} = process.env;
const massive = require('massive')
const bodyParser = require('body-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(bodyParser.json());
app.use(bodyParser.text());

//Start Functions
async function getUsersInRoom(roomid){
  let userNames = await io.in(roomid).fetchSockets()
  return userNames; 
}

async function syncVotesForRoom(roomid){
  let data = await io.in(roomid).fetchSockets()
  return data; 
}
//End Functions

//Start Socket Events
io.on('connection', (socket) => {
  socket.on('join', (roomcode, name)=> {
    socket.username = name
    socket.join(roomcode)
  })
  socket.on('chat message', (msg, roomcode) => {
    socket.data = msg
    io.to(roomcode).emit('incoming data', msg)
  });
  socket.on('syncVotes', (roomcode)=> {
    let votes = [];
    syncVotesForRoom(roomcode).then((data => {
      for(var v = 0; v < data.length; v++){
        console.log(data[v])
        votes.push(data[v].data)}
      io.to(roomcode).emit("votes", votes)
    }))
  })
  socket.on('delete data', () => {
    socket.data = {}
    socket.broadcast.emit('delete data')
  });
  socket.on('reveal', (roomcode) => {
    socket.join(roomcode)
    io.to(roomcode).emit('reveal')
  });
  socket.on('newuser', (roomcode) => {
    let list = [];
    getUsersInRoom(roomcode).then((userNames => {
      for(var s = 0; s<userNames.length; s++){
        console.log(userNames[s])
        list.push(userNames[s].username)}
      io.to(roomcode).emit("list", list)
    }))
    socket.join(roomcode)
    let votes = [];
    syncVotesForRoom(roomcode).then((data => {
      for(var v = 0; v < data.length; v++){
        console.log(data[v])
        votes.push(data[v].data)}
      io.to(roomcode).emit("votes", votes)
    }))
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});
//End Socket Events

//Start API - Not currently in use
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

massive(CONNECTION_STRING).then((db)=> {
  db.reload().then((db)=> {app.set('db', db)})
  console.log('DB Connected!')
  
}).catch((error)=> console.log(error));
//End API