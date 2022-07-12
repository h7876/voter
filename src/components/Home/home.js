import React, { Component } from 'react';
import { Toolbar, AppBar } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import StyledCards from '../Cards/Card';
import './home.css'
import { io } from 'socket.io-client';
const socket = io('http://localhost:3131');

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
      id: '',
      showBack: false
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
    this.toggleBack = this.toggleBack.bind(this)
    this.copyText = this.copyText.bind(this)
    this.addAnonPersonToRoom = this.addAnonPersonToRoom.bind(this)
  }
  componentDidMount() {
    socket.on('connect', () => {
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
    socket.on('list', (list) => {
      this.setState({people: list})
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
    socket.emit('join', this.state.handleRoom, this.state.name)
    this.setState({ room: this.state.handleRoom, isHost: false, showBack: 'true' }, this.addAnonPersonToRoom(socket.id, this.state.handleRoom, this.state.name))
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
    this.setState({ room: newRoom, isHost: true , showBack: 'true'}, (() => this.reJoin(newRoom)))
  }
  reveal() {
    console.log(this.state.members)
    this.setState({
      reveal: !this.state.reveal
    })
  }
  getPeople(roomid){
    this.newUser(this.state.name, roomid)
  }
  addAnonPersonToRoom(personalId, roomid, name){
    this.getPeople(roomid)
  }
  newUser(username, roomid){
    socket.emit('newuser', roomid)
  }
  toggleBack(){
    this.setState({room: '', create:'', showBack: !this.state.showBack})
  }
  copyText(){
    navigator.clipboard.writeText(this.state.room);
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
    const backArrowStyles = {
        backgroundColor: 'transparent',
        border: 'none',
        left:5,
        top:70,
        position:'absolute',
        width: 35,
        height:35
    }

    const back = (
      <div>
        {this.state.showBack ? <button style={backArrowStyles} onClick={this.toggleBack}>
          <svg onClick={this.toggleBack} style={{ position: "absolute", top: 0, left: 0, cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 18 18">
            <path onClick={this.toggleBack} style={{ cursor: "pointer" }} fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H
        14.5A.5.5 0 0 0 15 8z" />
          </svg>
        </button> : null}
      </div>
    )
      
    let createOrJoin = <div id="start">
      <button style={{ position: 'relative' }} onClick={(() => { this.setState({ create: 'true', showBack: 'true' }) })}>Create Room</button>
      <button style={{ position: 'relative' }} onClick={(() => { this.setState({ create: 'false', showBack: 'true' }) })}>Join Room</button>
    </div>

    let create = 
    <div id="no">
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
      <svg id="copy" onClick={this.copyText} style={{position:'absolute', top:'100px', left:'190px', cursor:'pointer'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-files" viewBox="0 0 16 16">
        <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
      </svg>
      <h3 style={{ position: 'absolute', top: '120px', left: '10px' }}>People in Room:</h3>
      <div style={{ position: 'absolute', top: '160px', left: '10px' }}>{this.state.people.map((el, i) => {
        return (
          <div key={i + el}>
            <h3>{el}</h3>
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

    let showOptions = this.state.room;
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
    if (this.state.room) {
      options = content
    }

    return (
      <div>
        {back}
        <ThemeProvider theme={this.theme}>
        <h1 className="title">Voter</h1>
          <AppBar position="fixed">
            <Toolbar />
          </AppBar>
        </ThemeProvider>
        {options}
      </div>
    )
  }
}