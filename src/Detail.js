import React,  { useState, useEffect } from 'react';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useAuth } from "./provider/authProvider.js";

function Detail() {
  const { id } = useParams();
  const [data, setData] = useState({});
  const { token } = useAuth();
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    // get information on this breed to display
    fetch(`/api/detail?ids[]=${id}`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(r => r.json())
      .then(response => {
        if(response.data && response.data[id]){
          const row = response.data[id]
          const formattedData = 
          {
            id: row[0],
            type: row[1],
            name: row[2],
            info: row[3],
            image_url: row[4]
          };

          setData(formattedData)
        }
      });

    //check whether this breed is favorited (will determine state of star icon)
    fetch('/api/favorited', { 
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        'id': id
      })
    }).then(r => r.json())
      .then(response => {
        setFavorited(response.result)
      });
  }, [id, token])

  const toggleFavorite = () => {
    if(!favorited){
      fetch('/api/favorite', { 
        method: 'post',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'id': id,
          'type': data.type
        })
      }).then(response => {
        if (response.status === 200) {
          setFavorited(true)
        } else {
          console.error('Failed to toggle favorite');
        }
      })
    }
    else{
      fetch('/api/unfavorite', { 
        method: 'post',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'id': id,
          'type': data.type
        })
      }).then(response => {
        if (response.status === 200) {
          setFavorited(false)
        } else {
          console.error('Failed to toggle favorite');
        }
      })
    }
  }

  return (
    <Container>
      <Row>
        <Col sm='4'>
          <Image className="img-fluid" style={{ maxWidth: '100%' }} src={
            (data.image_url !== '') 
            ? data.image_url 
            : data.type === 'dog' 
              ? 'https://t4.ftcdn.net/jpg/01/37/61/85/360_F_137618552_sLOm3M9gMb9J7xNawMIztRfoXxgys7pa.jpg'
              : 'https://t4.ftcdn.net/jpg/01/06/72/79/360_F_106727924_lb4hNMxPuj3FQdWKO53aZ4f6YYOjjCSK.jpg'
            }
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = (data.type === 'dog')
              ? 'https://t4.ftcdn.net/jpg/01/37/61/85/360_F_137618552_sLOm3M9gMb9J7xNawMIztRfoXxgys7pa.jpg'
              : 'https://t4.ftcdn.net/jpg/01/06/72/79/360_F_106727924_lb4hNMxPuj3FQdWKO53aZ4f6YYOjjCSK.jpg';
            }}
          />
        </Col>
        <Col sm='8'>
          <Row>
            <h2 style={{display: 'inline'}}>
              {data.name}
              <Button variant="link" display='inline' onClick={() => toggleFavorite()}>
                {
                  favorited
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star-fill" viewBox="0 0 16 16">
                      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                    </svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-star" viewBox="0 0 16 16">
                      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                    </svg>
                }
                
              </Button>
            </h2>
          </Row>
          <p>{data.info}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default Detail;
