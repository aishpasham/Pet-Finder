import React,  { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from "./provider/authProvider.js";
import FavoritesDisplay from './FavoritesDisplay.js';

function Profile() {
  const [data, setData] = useState({username: '', favorite_cats: [], favorite_dogs: []});
  const { token } = useAuth();

  useEffect(() => {
    fetch(`/api/user`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(r => r.json())
      .then(response => {
        if(response.data){
          setData(response.data)
        }
      });
  }, [token])

  return (
    <Container>
      <h2>Hello, {data.username}!</h2>
      <br/>
      
      {data.favorite_cats.length !== 0 
        ? <div>
            <h5>Your favorited cat breeds:</h5>
            <FavoritesDisplay ids={data.favorite_cats} />
          </div>
        : <h5>You have not yet favorited any cat breeds.</h5>
      }
      
      {data.favorite_dogs.length !== 0
        ? <div>
            <h5>Your favorited dog breeds:</h5>
            <FavoritesDisplay ids={data.favorite_dogs} />
          </div>
        : <h5>You have not yet favorited any dog breeds.</h5>
      }
    </Container>
  );
}

export default Profile;
