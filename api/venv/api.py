import os
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
import sqlite3

db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    roles = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default='true')
    favorited_cat_breeds = db.Column(db.Text)
    favorited_dog_breeds = db.Column(db.Text)

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []
        
    @property
    def favorite_cats(self):
        if self.favorited_cat_breeds:
            return self.favorited_cat_breeds.split(',')
        else:
            return []

    @property
    def favorite_dogs(self):
        if self.favorited_dog_breeds:
            return self.favorited_dog_breeds.split(',')
        else:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active


# Initialize flask app for the example
app = flask.Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the example app
cors.init_app(app)

# Add users for the example
with app.app_context():
    db.create_all()
    if db.session.query(User).filter_by(username='samantha').count() < 1:
        db.session.add(User(
          username='samantha',
          password=guard.hash_password('mypassword'),
          roles='admin',
          favorited_cat_breeds = '',
          favorited_dog_breeds = ''
            ))
    db.session.commit()


# set up routes
@app.route('/api/breeds', methods=['GET'])
@flask_praetorian.auth_required
def search():
    query = flask.request.args.get('query', None)
    if query is None:
        return "No query parameter provided", 400

    conn = sqlite3.connect('dogs_and_cats.db')
    c = conn.cursor()
    sql_command = "SELECT * FROM dogs_and_cats WHERE name LIKE ?"
    c.execute(sql_command, (f'%{query}%',))
    rows = c.fetchall()
    conn.close()
    return flask.jsonify({"data": rows}), 200

@app.route('/api/detail', methods=['GET'])
@flask_praetorian.auth_required
def get_ids():
    ids = flask.request.args.getlist('ids[]')
    if not ids:
        return flask.jsonify({'message': 'No IDs provided'}), 400

    conn = sqlite3.connect('dogs_and_cats.db')
    c = conn.cursor()
    data = {}
    for id in ids:
        sql_command = "SELECT * FROM dogs_and_cats WHERE id = ?"
        c.execute(sql_command, (id,))
        row = c.fetchone()
        data[id] = row
    conn.close()
    return flask.jsonify({"data": data}), 200
  

@app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
    issuing a JWT token.
    .. example::
       $ curl http://localhost:5000/api/login -X POST \
         -d '{"username":"samantha","password":"mypassword"}'
    """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

  
@app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refrehsed access expiration.
    .. example::
       $ curl http://localhost:5000/api/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = flask.request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200
  
  
@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    """
    A protected endpoint. The auth_required decorator will require a header
    containing a valid JWT
    .. example::
       $ curl http://localhost:5000/api/protected -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    return {'message': f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}


@app.route('/api/user', methods=['GET'])
@flask_praetorian.auth_required
def get_user_info():
  try:
    user = flask_praetorian.current_user()
    user_info_response = {
        'username': user.username,
        'favorite_cats': user.favorite_cats,
        'favorite_dogs': user.favorite_dogs
    }
    return flask.jsonify({'data': user_info_response}), 200
  except Exception as e:
    return flask.jsonify({'message': str(e)}), 401


@app.route('/api/favorite', methods=['POST'])
@flask_praetorian.auth_required
def add_favorite_breed():
  try:
    req = flask.request.get_json(force=True)
    breed_id = req.get('id', None)
    breed_type = req.get('type', None)

    user = flask_praetorian.current_user()
    
    if breed_type == 'cat':
      if user.favorited_cat_breeds:
          user.favorited_cat_breeds += f',{breed_id}'
      else:
          user.favorited_cat_breeds = breed_id
    else:
      if user.favorited_dog_breeds:
          user.favorited_dog_breeds += f',{breed_id}'
      else:
          user.favorited_dog_breeds = breed_id
    
    db.session.commit()
    
    return flask.jsonify({'message': f'Breed ID {breed_id} favorited successfully.'}), 200
  except Exception as e:
    return flask.jsonify({'message': str(e)}), 500
    

@app.route('/api/unfavorite', methods=['POST'])
@flask_praetorian.auth_required
def remove_favorite_breed():
  try:
    req = flask.request.get_json(force=True)
    breed_id = str(req.get('id', None))
    breed_type = req.get('type', None)
    user = flask_praetorian.current_user()
    
    # get current favorited breeds
    if breed_type == 'cat':
        favorited_breeds = user.favorited_cat_breeds.split(',')
    else:
        favorited_breeds = user.favorited_dog_breeds.split(',')
    
    # remove from favorited breeds
    favorited_breeds.remove(breed_id)
    
    # convert back to string for storage
    if breed_type == 'cat':
        user.favorited_cat_breeds = ','.join(favorited_breeds)
    else:
        user.favorited_dog_breeds = ','.join(favorited_breeds)
    
    db.session.commit()
    
    return flask.jsonify({'message': f'Breed ID {breed_id} removed from favorites successfully.'}), 200
  except Exception as e:
    return flask.jsonify({'message': str(e)}), 500
    

@app.route('/api/favorited', methods=['POST'])
@flask_praetorian.auth_required
def check_favorited():
  try:
    req = flask.request.get_json(force=True)
    breed_id = str(req.get('id', None))
    user = flask_praetorian.current_user()
    
    # check whether breed is favorited
    if breed_id in user.favorited_cat_breeds.split(',') or breed_id in user.favorited_dog_breeds.split(','):
        return flask.jsonify({'result': True}), 200
    else:
        return flask.jsonify({'result': False}), 200
  except Exception as e:
    return flask.jsonify({'message': str(e)}), 500
  

# Run the example
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
