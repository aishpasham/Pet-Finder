import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useAuth } from './provider/authProvider'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { token, setToken } = useAuth();
  const [message, setMessage] = useState('');

  const onSubmitClick = (e) => {
    e.preventDefault();
    let opts = {
      'username': username,
      'password': password
    };
    fetch('/api/login', {
      method: 'post',
      body: JSON.stringify(opts)
    }).then(r => r.json())
      .then(token => {
        if (token.access_token) {
          setToken(token.access_token);
          setMessage('');
        } else {
          setMessage("Incorrect username/password! Please try again.");
        }
      });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  
  return (
    <Container>
      {!token ? 
      <Form onSubmit={onSubmitClick}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={handleUsernameChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Form.Group>
        <p className='error'>{message}</p>
        <Button variant="secondary" type="submit">
          Login Now
        </Button>
      </Form>
      : 
      <div>
        <p>You are logged in!</p>
        <Button variant="secondary" onClick={() => setToken()}>Logout</Button>
      </div>}
    </Container>
  );
}

export default Login;
