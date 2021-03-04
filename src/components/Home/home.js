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
          room: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit = this.submit.bind(this)
        this.clearStuff = this.clearStuff.bind(this)
        this.joinRoom = this.joinRoom.bind(this)
        this.name = this.name.bind(this)
        this.room = this.room.bind(this)
    }
    componentDidMount(){
      this.showStuff();
      socket.on('incoming data', (msg)=> {
        this.updateMessage(msg)
      })
      socket.on('name',(name)=> {
        alert(name)
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
        // socket.emit('chat message', event.target.value);
        this.showStuff();
      }
      submit(){
        socket.emit('chat message', this.state.messageHandler);
      }
      updateMessage(msg){
        let members = [...this.state.members]
        
        members.push(msg)
        this.setState({members:members})
      }
      showStuff(){
        console.log('hey')
      }
      clearStuff(){
        this.setState({members: []})
        socket.emit('delete data', this.state.members)
      }
      name(event){
        this.setState({name: event.target.value})
      }
      joinRoom(){
        socket.emit('join', this.state.room, this.state.name)
      }
      room(event){
        this.setState({room: event.target.value})
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
        return(
            <div>
                <ThemeProvider theme={this.theme}>
                  <AppBar position="fixed">
                    <Toolbar/>
                  </AppBar>
                </ThemeProvider>
                <div style={{position:'absolute', marginTop:'230px'}} >{this.state.message}</div>
                <input style={{position:'absolute', marginTop:'200px'}} onChange={this.handleChange}></input>
                <button style={{position:'relative', marginTop:'220px'}} onClick={this.submit}>Submit</button>
                <button style={{position:'relative', marginTop:'230px'}} onClick={this.clearStuff}>Clear</button>
                <br></br>
                <input style={{position:'absolute', marginTop:'200px'}} onChange={this.room}></input>
                <input style={{position:'relative', marginTop:'200px'}} onChange={this.name}></input>
                <button style={{position:'relative', marginTop:'230px'}} onClick={this.joinRoom}>join</button>

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
        )
    }
}