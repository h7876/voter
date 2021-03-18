import React from 'react';
import { styled } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

const NewCard = styled(Card)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 250,
  width: 150,
  padding: '0 30px',
});

export default function StyledCards(text) {
  return <NewCard>
    
    {text.message ? 
    <div>
      {text.name}<br></br>{text.message}
    </div>
    : 
    <div>
    {text}
    </div>
    }
    </NewCard>;
}