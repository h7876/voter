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
          message: {},
          messageHandler: '',
          name: '',
          handleRoom: '',
          room: '',
          create: '',
          isHost: false,
          reveal: false
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
    }
    componentDidMount(){
      socket.on('incoming data', (msg)=> {
        this.updateMessage(msg)
      })
      socket.on('name',(name)=> {
        // maybe do stuff relating to people joining here
      })
      socket.on('reveal',()=> {
        this.reveal()
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
        let {name, message} = {name: this.state.name, message:this.state.messageHandler}
        this.setState({message:{message, name}, messageHandler: ''}, (()=> {
          socket.emit('chat message', this.state.message, this.state.room);
          console.log(this.state.message)
        }))
      }
      updateMessage(msg){
        console.log("maybe")
        let members = [...this.state.members]
        
        members.push(msg)
        this.setState({members:members}, (()=> {console.log(members)}))
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
        this.setState({room: this.state.handleRoom, isHost:false}, (()=> this.reJoin()))
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
        this.setState({room: newRoom, isHost:true}, (()=> this.reJoin()))
      }
      reveal(){
        this.setState({reveal: !this.state.reveal
      })}
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
      let createOrJoin = <div id="start">
        <button style={{position:'relative'}} onClick={(()=> {this.setState({create: 'true'})})}>Create Room</button>
        <button style={{position:'relative'}} onClick={(()=> {this.setState({create: 'false'})})}>Join Room</button>
      </div>
      let create = <div id="no">
                <input style={{position:'relative'}} onChange={this.handleName} placeholder="Name"></input>
                <button style={{position:'relative'}} onClick={this.createRoom}>Create</button>
      </div>
            let join = <div id="no">
                <input  style={{position:'relative'}} onChange={this.handleRoom} placeholder="Room Code"></input>
                <br></br>
                <input style={{position:'relative'}} onChange={this.handleName} placeholder="Name"></input>
                <button style={{position:'relative'}} onClick={this.joinRoom}>Join</button>
            </div>
            let content = <div>
               <h3 style={{position:'absolute', top:'80px', left:'10px'}}>Room Code: {this.state.room}</h3>
               {/* <h3 style={{position:'absolute', marginTop:'220px'}}>{this.state.name}</h3> */}
               {/* <h3 style={{position:'absolute', marginTop:'240px'}}>{this.state.isHost.toString()}</h3> */}
                {/* <div style={{position:'absolute', marginTop:'230px'}} >{this.state.message}</div> */}

                {this.state.isHost ? 
                  <div id="no">
                    <input  value={this.state.messageHandler} style={{position:'relative'}} onChange={this.handleChange} placeholder="Type your vote here..."></input>
                    <button className="submit"  onClick={this.submit}>Submit</button>
                    <button style={{position:'relative'}} onClick={this.clearStuff}>Clear</button>
                    <button style={{position:'relative'}} onClick={()=>
          socket.emit('reveal', this.state.room)
        }>Reveal</button> 
                  </div>
                : 
                <div id="no" style={{position:'relative'}}>
                <input value={this.state.messageHandler} style={{position:'relative'}} onChange={this.handleChange} placeholder="Type your vote here..."></input>
                  <button style={{position:'relative'}} onClick={this.submit}>Submit</button>
                  </div>
                }
              <div style={{paddingTop:'50px', margin:'auto',width: '50%'}}>
              {this.state.reveal === true ?
                          <div style={styles.div}>{this.state.members.map((el, i)=> {
                            return (
                                  <div key={i + el} className="flip-card-flip">
                                  <div className="flip-card-inner">
                                    <div className="flip-card-back">
                                      {StyledCards(el)}
                                    </div>
                                    <div className="flip-card-front">
                                          {/* {StyledCards(el.name)} */}
                                        </div>

                                  </div>
                                </div>

                            );})}
                               </div>
                               :
                               <div style={styles.div}>{this.state.members.map((el, i)=> {
                                return (
                                  
                
                                      <div key={i + el} className="flip-card">
                                      <div className="flip-card-inner">
                                        <div className="flip-card-front">
                                          {StyledCards(el.name)}
                                        </div>
                                        <div className="flip-card-back">
                                          {StyledCards(el.name)}
                                        </div>
                                      </div>
                                    </div>
                                );})}
                                   </div>  
            }
              {/* <div style={styles.div}>{this.state.members.map((el, i)=> {
                return (
                  

                      <div class="flip-card-flip">
                      <div class="flip-card-inner">
                        <div key={el + i} class="flip-card-front">
                          {StyledCards(el.name)}
                        </div>
                        <div key={el + i + "back"} class="flip-card-back">
                          {StyledCards(el)}
                        </div>
                      </div>
                    </div>
                    

                  

                );})}
                   </div> */}

                   
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