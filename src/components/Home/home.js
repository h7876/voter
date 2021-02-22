import React, { Component } from 'react';
import { Toolbar, AppBar} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import StyledCards from '../Cards/Card';
import './home.css'


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
            <div backgroundColor="gray">
                <ThemeProvider theme={this.theme}>
                  <AppBar position="fixed">
                    <Toolbar/>
                  </AppBar>
                </ThemeProvider>
              <div style={{paddingTop:'300px', margin:'auto',width: '50%'}}>
              <div style={styles.div}>{this.state.members.map((el, i)=> {
                return(
                  <div style={styles.card}>
                    {StyledCards(el)}
                  </div>
                  )})}
              </div>
             </div>
            </div>
        )
    }
}