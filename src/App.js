import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./provider/authProvider.js";

import { Container, Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Explore from './Explore';
import Home from './Home';
import Login from './Login';
import PrivateRoute from './PrivateRoute';
import Detail from './Detail';
import Profile from './Profile';

export default function App() {
  const { token } = useAuth();

  return (
  <Router>
    <div>
    <Navbar sticky="top" data-bs-theme="light">
      <Container>
      <Navbar.Brand >Kawaii Critters</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Item>
            <Nav.Link href="/">Home</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/explore">Explore</Nav.Link>
          </Nav.Item>
          
          {/* Any other new page links go here */}
        </Nav>
        <Nav>
          <Nav.Item>
            <Nav.Link href="/profile" disabled={!token}> 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
              </svg> 
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/login">{token? 'Log Out' : 'Log In'}</Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>
    </Navbar>

      {/* A <Routes> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
        <Routes>
          {/* Any routes that should only be accessible when user is logged in should go inside a PrivateRoute (like Home and Secret)*/}

          <Route path='/' element={<PrivateRoute/>}>
            <Route path="/" element={<Home />}/>
          </Route>

          <Route path="/login" element={<Login />}/>

          <Route path='/' element={<PrivateRoute/>}>
            <Route path='explore' element={<Explore/>}/>
          </Route>

          <Route path='/' element={<PrivateRoute/>}>
            <Route path='detail/:id' element={<Detail/>}/>
          </Route>

          <Route path='/' element={<PrivateRoute/>}>
            <Route path='profile' element={<Profile/>}/>
          </Route>

        </Routes>
    </div>
  </Router>
  );
}
