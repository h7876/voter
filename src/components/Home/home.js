import React, { Component } from 'react';
import { Toolbar, AppBar } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import StyledCards from '../Cards/Card';
import './home.css'
import { io } from "socket.io-client";
import axios from 'axios';

const socket = io("http://localhost:3131");
export default class Home extends Component {

  constructor() {
    super();
    this.state = {
      members: [],
      stuffs: [],
      message: {},
      messageHandler: '',
      name: '',
      handleRoom: '',
      room: '',
      create: '',
      isHost: false,
      reveal: false,
      people: [],
      id: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.submit = this.submit.bind(this)
    this.clearStuff = this.clearStuff.bind(this)
    this.joinRoom = this.joinRoom.bind(this)
    this.createRoom = this.createRoom.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleRoom = this.handleRoom.bind(this)
    this.reJoin = this.reJoin.bind(this)
    this.reveal = this.reveal.bind(this)
    this.getPeople = this.getPeople.bind(this)
    this.newUser = this.newUser.bind(this)
  }
  componentDidMount() {
    socket.on("connect", () => {
      this.setState({id: socket.id})
    });
    socket.on('incoming data', (msg) => {
      this.updateMessage(msg)
    })
    socket.on('reveal', () => {
      this.reveal()
    })
    socket.on('delete data', () => {
      this.setState({ members: [] })
    })
    socket.on('list', (people) => {
      this.setState({people: people.people})
    })
  }
  theme = createMuiTheme({
    palette: {
      primary: {
        main: '#212121',
      },
      secondary: {
        main: '#f44336',
      },
    },
  });

  handleChange(event) {
    this.setState({ messageHandler: event.target.value })
  }
  submit() {
    let { name, message } = { name: this.state.name, message: this.state.messageHandler }
    this.setState({ message: { message, name }, messageHandler: '' }, (() => {
      socket.emit('chat message', this.state.message, this.state.room);
    }))
  }
  updateMessage(msg) {
    console.log("maybe")
    let members = [...this.state.members]

    members.push(msg)
    this.setState({ members: members, reveal: false }, (() => { console.log(members) }))
  }

  clearStuff() {
    this.setState({ members: [] })
    socket.emit('delete data', this.state.members)
  }
  handleName(event) {
    this.setState({ name: event.target.value })
  }
  joinRoom() {
    socket.emit('join', this.state.room, this.state.name)
    this.setState({ room: this.state.handleRoom, isHost: false }, (() => this.addAnonPersonToRoom(socket.id, this.state.room, this.state.name)))
  }
  reJoin(newRoom) {
    if (this.state.room) {
      socket.emit('join', this.state.room, this.state.name)
      this.addAnonPersonToRoom(socket.id, this.state.room, this.state.name)
    }
    else {
      socket.emit('join', newRoom, this.state.name)
    }
  }
  handleRoom(event) {
    this.setState({ handleRoom: event.target.value })
  }
  createRoom() {
    let newRoom = Math.random().toString(36).substr(2, 5);
    this.setState({ room: newRoom, isHost: true }, (() => this.reJoin(newRoom)))
  }
  reveal() {
    console.log(this.state.members)
    this.setState({
      reveal: !this.state.reveal
    })
  }
  getPeople(roomid){
    axios.get(`/api/room/getPeople/${roomid}`).then((res)=> {
      let listOfPeople = [...res.data]
      this.setState({people: listOfPeople}, this.newUser(listOfPeople, roomid))
     
    })
  }
  addAnonPersonToRoom(personalId, roomid, name){
    axios.post('/api/room/addPerson', {personalId, roomid, name}).then(()=> {
      this.getPeople(roomid)
    }).catch((err)=> console.log(err))
  }
  newUser(listOfPeople, roomid){
    socket.emit('newuser',{"people":listOfPeople}, roomid)
  }

  render() {
    const styles = {
      div: {
        display: 'flex',
        direction: 'row',
        width: '100%',
        justify: 'center',
        flexWrap: 'wrap'

      },
      card: {
        flex: 1,
        height: '100%',
        justify: 'center',
        margin: 10,
        textAlign: 'center',
        padding: 10
      }
    };
    let createOrJoin = <div id="start">
      <button style={{ position: 'relative' }} onClick={(() => { this.setState({ create: 'true' }) })}>Create Room</button>
      <button style={{ position: 'relative' }} onClick={(() => { this.setState({ create: 'false' }) })}>Join Room</button>
    </div>
    let create = <div id="no">
      <input style={{ position: 'relative' }} onChange={this.handleName} placeholder="Name"></input>
      <button style={{ position: 'relative' }} onClick={this.createRoom}>Create</button>
    </div>
    let join = <div id="no">
      <input style={{ position: 'relative' }} onChange={this.handleRoom} placeholder="Room Code"></input>
      <br></br>
      <input style={{ position: 'relative' }} onChange={this.handleName} placeholder="Name"></input>
      <button style={{ position: 'relative' }} onClick={this.joinRoom}>Join</button>
    </div>
    let content = <div>
      <h3 style={{ position: 'absolute', top: '80px', left: '10px' }}>Room Code: {this.state.room}</h3>
      <h3 style={{ position: 'absolute', top: '120px', left: '10px' }}>People in Room:</h3>
      <div style={{ position: 'absolute', top: '160px', left: '10px' }}>{this.state.people.map((el, i) => {
        return (
          <div key={i + el}>
            <h3>{el.name}</h3>
          </div>
        );
      })}
      </div>
      {this.state.isHost ?
        <div id="no">
          <input value={this.state.messageHandler} style={{ position: 'relative' }} onChange={this.handleChange} placeholder="Type your vote here..."></input>
          <button className="submit" onClick={this.submit}>Submit</button>
          <button style={{ position: 'relative' }} onClick={this.clearStuff}>Clear</button>
          <button style={{ position: 'relative' }} onClick={() =>
            socket.emit('reveal', this.state.room)
          }>Reveal</button>
        </div>
        :
        <div id="no" style={{ position: 'relative' }}>
          <input value={this.state.messageHandler} style={{ position: 'relative' }} onChange={this.handleChange} placeholder="Type your vote here..."></input>
          <button style={{ position: 'relative' }} onClick={this.submit}>Submit</button>
        </div>
      }
      <div style={{ paddingTop: '50px', margin: 'auto', width: '50%' }}>
        {this.state.reveal === true ?
          <div style={styles.div}>{this.state.members.map((el, i) => {
            return (
              <div key={i + el} className="flip-card-flip">
                <div className="flip-card-inner">
                  <div className="flip-card-back">
                    {StyledCards(el, this.state.reveal)}
                  </div>
                  <div className="flip-card-front">
                    {StyledCards(el, false)}
                  </div>

                </div>
              </div>
            );
          })}
          </div>
          :
          <div style={styles.div}>{this.state.members.map((el, i) => {
            return (
              <div key={i + el} className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    {StyledCards(el, this.state.reveal)}
                  </div>
                  <div className="flip-card-back">
                    {StyledCards(el, true)}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        }
      </div>
    </div>

    const showOptions = this.state.room;
    let options;
    if (!showOptions && this.state.create === 'true') {
      options = create

    }
    if (!showOptions && this.state.create === 'false') {
      options = join
    }
    if (!showOptions && !this.state.create) {
      options = createOrJoin
    }
    if (showOptions) {
      options = content
    }
    return (
      <div>
        <h1 className="title">Voter</h1>
        <ThemeProvider theme={this.theme}>
          <AppBar position="fixed">
            <Toolbar />
          </AppBar>
        </ThemeProvider>
        {options}
      </div>
    )
  }
}