import sqlite3
import requests

# creating SQLite db connection
conn = sqlite3.connect('dogs_and_cats.db')
c = conn.cursor()

# creating table 
c.execute('''CREATE TABLE IF NOT EXISTS dogs_and_cats
             (id INTEGER PRIMARY KEY, type TEXT, name TEXT, info TEXT, image_url TEXT)''')

# retrieving data from cat API and inserting to db
cat_response = requests.get('https://api.thecatapi.com/v1/breeds')
cat_data = cat_response.json()
for cat_breed in cat_data:
    name = cat_breed['name']
    temperament = cat_breed.get('temperament', '')
    origin = cat_breed.get('origin', '')
    life_span = cat_breed.get('life_span', '')
    weight_imperial = cat_breed.get('weight', {}).get('imperial', '')
    wiki_url = cat_breed.get('wikipedia_url', '')
    info = f"Temperament: {temperament}, Origin: {origin}, Life Span: {life_span}, Weight: {weight_imperial}, Wikipedia URL: {wiki_url}"
    breed_id = cat_breed['reference_image_id'] if 'reference_image_id' in cat_breed else ''
    image_url = f'https://cdn2.thecatapi.com/images/{breed_id}.jpg' if breed_id else ''
    c.execute('SELECT name FROM dogs_and_cats WHERE name = ?', (name,))
    existing_entry = c.fetchone()
    if not existing_entry:
        c.execute('INSERT INTO dogs_and_cats (type, name, info, image_url) VALUES (?, ?, ?, ?)', ('cat', name, info, image_url))

# retrieving data from dog API and inserting to db
dog_response = requests.get('https://api.thedogapi.com/v1/breeds')
dog_data = dog_response.json()
for dog_breed in dog_data:
    name = dog_breed['name']
    temperament = dog_breed.get('temperament', '')
    life_span = dog_breed.get('life_span', '')
    weight_imperial = dog_breed.get('weight', {}).get('imperial', '')
    info = f"Temperament: {temperament}, Life Span: {life_span}, Weight: {weight_imperial}"
    breed_id = dog_breed['reference_image_id']
    image_url = f'https://cdn2.thedogapi.com/images/{breed_id}.jpg' if breed_id else ''
    c.execute('SELECT name FROM dogs_and_cats WHERE name = ?', (name,))
    existing_entry = c.fetchone()
    if not existing_entry:
        c.execute('INSERT INTO dogs_and_cats (type, name, info, image_url) VALUES (?, ?, ?, ?)', ('dog', name, info, image_url))
# commiting db changes and closing connection
conn.commit()
conn.close()
