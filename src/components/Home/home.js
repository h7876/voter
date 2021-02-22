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
          members: ["1", "2", "3"]
        }
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

      handleChange(input){
        socket.emit('chat message', input);
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
                <input style={{position:'absolute', marginTop:'200px'}} onChange={event => this.handleChange(event.target.value)}></input>
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