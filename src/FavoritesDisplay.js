import { useState, useEffect } from 'react';
import { Button, Card, Container, Row } from 'react-bootstrap';
import { useAuth } from "./provider/authProvider.js";
import { useNavigate } from 'react-router-dom';

function FavoritesDisplay(props) {
  const [data, setData] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  const navigateToDetailPage = (id) => {
      navigate(`/detail/${id}`);
  }

  useEffect(() => {
    // get information on all breeds to display
    if(props.ids.length !== 0){
      const idQueryString = props.ids.map(id => `ids[]=${id}`).join('&');
      fetch(`/api/detail?${idQueryString}`, {
        method: 'get',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.json())
        .then(response => {
          if(response.data){
            const newData = Object.keys(response.data).map(id => {
              const row = response.data[id];
              return {
                id: row[0],
                type: row[1],
                name: row[2],
                info: row[3],
                image_url: row[4]
              };
            });
  
            setData(newData);
          }
        });
    }
  }, [props.ids, token])

  return (
    <Container>
      {data.map((item, index) => (
        index % 3 === 0 ? <Row key={index}> {/* Start a new row for every third item */}
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

export default FavoritesDisplay;
