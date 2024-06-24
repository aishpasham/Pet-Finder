import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useAuth } from "./provider/authProvider.js";
import { useNavigate } from 'react-router-dom';

function Explore() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState([])
  const {token} = useAuth();

  const navigate = useNavigate();

  const navigateToDetailPage = (id) => {
      navigate(`/detail/${id}`);
  }

  const onSubmitClick = (e) => {
    e.preventDefault();
    fetch(`/api/breeds?query=${query}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(r => r.json())
      .then(response => {
        if(response.data){
          const formattedData = response.data.map(item => {
            return {
                id: item[0],
                type: item[1],
                name: item[2],
                info: item[3],
                image_url: item[4]
            };
          });
          setData(formattedData)
        }
      });
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <Container>
      <Form onSubmit={onSubmitClick} className="mb-4">
        <Form.Group as={Row} className="justify-content-md-center">
          <Col sm="4">
            <Form.Control 
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Type in a breed here..." />
          </Col>
          <Col sm="2">
            <Button variant="primary" type="submit">
              Search
            </Button>
          </Col>
        </Form.Group>
    </Form>

    {data.map((item, index) => (
    index % 3 === 0 ? <Row key={index} className={`justify-content-${data.length < 3 ? 'start' : 'center'} mb-5 w-100`}> {/* Start a new row for every third item */}
      {data.slice(index, index + 3).map(subItem => (
        <Card style={{ width: '18rem', margin: '2rem', paddingTop: '1rem'}}>
          <Card.Img variant="top" 
          src={
            (subItem.image_url !== '') 
            ? subItem.image_url 
            : subItem.type === 'dog' 
              ? 'https://t4.ftcdn.net/jpg/01/37/61/85/360_F_137618552_sLOm3M9gMb9J7xNawMIztRfoXxgys7pa.jpg'
              : 'https://t4.ftcdn.net/jpg/01/06/72/79/360_F_106727924_lb4hNMxPuj3FQdWKO53aZ4f6YYOjjCSK.jpg'
            }
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = (subItem.type === 'dog')
              ? 'https://t4.ftcdn.net/jpg/01/37/61/85/360_F_137618552_sLOm3M9gMb9J7xNawMIztRfoXxgys7pa.jpg'
              : 'https://t4.ftcdn.net/jpg/01/06/72/79/360_F_106727924_lb4hNMxPuj3FQdWKO53aZ4f6YYOjjCSK.jpg';
            }}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}/>
          <Card.Body>
            <Card.Title>{subItem.name}</Card.Title>
            <Button variant="secondary" onClick={() => navigateToDetailPage(subItem.id)}>See More</Button>
          </Card.Body>
        </Card>
      ))}
    </Row> : null /* Skip rendering if not starting a new row */
  ))}
  </Container>
  );
}

export default Explore;
