import React, { Component } from 'react';
import { Toolbar, AppBar} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import StyledCards from '../Cards/Card';
import './home.css'
import { io } from "socket.io-client";

const socket = io("http://localhost:3131");
export default class Home extends Component {

    constructor(){
        super();
        this.state = {
          members: [],
          stuffs: [],
          message: "",
          messageHandler: '',
          name: '',
          handleRoom: '',
          room: '',
          create: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit = this.submit.bind(this)
        this.clearStuff = this.clearStuff.bind(this)
        this.joinRoom = this.joinRoom.bind(this)
        this.createRoom = this.createRoom.bind(this)
        this.handleName = this.handleName.bind(this)
        this.handleRoom = this.handleRoom.bind(this)
        this.reJoin = this.reJoin.bind(this)
    }
    componentDidMount(){
      socket.on('incoming data', (msg)=> {
        this.updateMessage(msg)
      })
      socket.on('name',(name)=> {
        // maybe do stuff relating to people joining here
      })
      socket.on('delete data', ()=> {
        this.setState({members: []})
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

      handleChange(event){
        this.setState({messageHandler: event.target.value})
        //this.showStuff();
      }
      submit(){
        this.setState({message:this.state.messageHandler, messageHandler: ''}, (()=> {
          socket.emit('chat message', this.state.message, this.state.room);
        }))
      }
      updateMessage(msg){
        console.log("maybe")
        let members = [...this.state.members]
        
        members.push(msg)
        this.setState({members:members})
      }
      // showStuff(){
        
      // }
      clearStuff(){
        this.setState({members: []})
        socket.emit('delete data', this.state.members)
      }
      handleName(event){
        this.setState({name: event.target.value})
      }
      joinRoom(){
        this.setState({room: this.state.handleRoom}, (()=> this.reJoin()))
      }
      reJoin(){
        if(this.state.room){
          socket.emit('join', this.state.room, this.state.name)
        }
      }
      handleRoom(event){
        this.setState({handleRoom: event.target.value})
      }
      createRoom(){
        let newRoom = Math.random().toString(36).substr(2, 5);
        this.setState({room: newRoom}, (()=> this.reJoin()))
      }
    render(){

      const styles = {
        div:{
          display: 'flex',
          direction: 'row',
          width: '100%',
          justify: 'center',
          flexWrap: 'wrap'
          
        },
        card:{
          flex: 1,
          height: '100%',
          justify: 'center',
          margin: 10,
          textAlign: 'center',
          padding: 10
        }
      };
      let createOrJoin = <div>
        <button style={{position:'relative', marginTop:'200px'}} onClick={(()=> {this.setState({create: 'true'})})}>Create Room</button>
        <button style={{position:'relative', marginTop:'200px'}}onClick={(()=> {this.setState({create: 'false'})})}>Join Room</button>
      </div>
      let create = <div>
                <input style={{position:'relative', marginTop:'200px'}} onChange={this.handleName}></input>
                <button style={{position:'relative', marginTop:'230px'}} onClick={this.createRoom}>Create</button>
      </div>
            let join = <div>
                <input style={{position:'absolute', marginTop:'200px'}} onChange={this.handleRoom}></input>
                <input style={{position:'relative', marginTop:'200px'}} onChange={this.handleName}></input>
                <button style={{position:'relative', marginTop:'230px'}} onClick={this.joinRoom}>Join</button>
            </div>
            let content = <div>
               <h3 style={{position:'absolute', marginTop:'200px'}}>{this.state.room}</h3>
               <h3 style={{position:'absolute', marginTop:'215px'}}>{this.state.name}</h3>
                {/* <div style={{position:'absolute', marginTop:'230px'}} >{this.state.message}</div> */}
                <input id="vote" value={this.state.messageHandler} style={{position:'absolute', marginTop:'200px'}} onChange={this.handleChange}></input>
                <button style={{position:'relative', marginTop:'220px'}} onClick={this.submit}>Submit</button>
                <button style={{position:'relative', marginTop:'230px'}} onClick={this.clearStuff}>Clear</button>

              <div style={{paddingTop:'300px', margin:'auto',width: '50%'}}>
                
              <div style={styles.div}>{this.state.members.map((el, i)=> {
                return(
                  <div key={el+i} style={styles.card}>
                    {StyledCards(el)}
                  </div>
                  )})}
              </div>
             </div>
            </div>
      const showOptions = this.state.room;
      let options;
      if(!showOptions && this.state.create === 'true'){
        options = create

      }
      if(!showOptions && this.state.create === 'false'){
        options = join
      }
      if(!showOptions && !this.state.create){
        options = createOrJoin
      }
      if(showOptions){
        options = content
      }
        return(
            <div>
                <ThemeProvider theme={this.theme}>
                  <AppBar position="fixed">
                    <Toolbar/>
                  </AppBar>
                </ThemeProvider>
                {options}
               
            </div>
        )
    }
}