// This code sets up an Express server, serves static files, and normalizes URLs to lowercase
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const { engine } = require('express-handlebars');
const bcrypt = require('bcrypt');
const session = require('express-session');
const https = require('https');
const PORT = process.env.PORT || 3000;

const app = express();


app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'index',layoutsDir: path.join(__dirname, 'views') // Ensure the layouts directory is set correctly
}));
app.set('view engine', 'hbs');
app.set('views', './views')



// Initialize the SQLite database; this will create the file if it doesn't exist
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run("CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT)", (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Books table created or already exists.');
      }
    });
  }
});

app.use(express.static('public'));


app.use(session({
  secret: '1234', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
  
}));



// Registration Endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  db.run('INSERT INTO users (userid, password, role) VALUES (?, ?, "guest")', [username, hashedPassword], (err) => {
      if (err) {
          res.status(500).send('Error registering user');
      } else {
          res.send('User registered successfully');
      }
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  res.send('Login endpoint reached');
});


app.get('/admin/users', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  db.get('SELECT role FROM users WHERE userid = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    
    if (row && row.role === 'admin') {
      // Perform admin actions
      // For example, list all users
      db.all('SELECT userid, role FROM users', [], (err, users) => {
        if (err) {
          return res.status(500).send('Error fetching users');
        }
        res.json(users);
      });
    } else {
      res.status(403).send('Access Denied');
    }
  });
});

app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  const normalizedUrl = req.originalUrl.toLowerCase();
  if (normalizedUrl !== req.originalUrl) {
      res.redirect(301, normalizedUrl);
  } else {
      next();
  }
});

app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
  res.render('index', {});
});

// Route to add a new book to the database
app.post('/add-book', (req, res) => {
  const { title, author } = req.body;
  const query = `INSERT INTO books (title, author) VALUES (?, ?)`;
  db.run(query, [title, author], function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.send(`Book added with ID: ${this.lastID}`);
  });
});

// Route to get all books from the database
app.get('/all-books', (req, res) => {
  db.all(`SELECT * FROM books`, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});


// Route to search for books using Google Books API
app.get('/books', (request, response) => {
  let bookTitle = request.query.title;
  if (!bookTitle) {
    response.json({ message: 'Please enter Book Title' });
    return;
  }

  let encodedTitle = encodeURIComponent(bookTitle);
  const options = {
    "method": "GET",
    "hostname": "www.googleapis.com",
    "port": null,
    "path": `/books/v1/volumes?q=intitle:${encodedTitle}`,
    "headers": {
      "useQueryString": true
    }
  };

  const req = https.request(options, function(apiResponse) {
    let bookData = '';
    apiResponse.on('data', function(chunk) {
      bookData += chunk;
    });
    apiResponse.on('end', function() {
      try {
        response.contentType('application/json').json(JSON.parse(bookData));
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        response.status(500).json({ error: 'Error parsing JSON response' });
      }
    });
  });

  req.on('error', function(error) {
    console.error('Error making API request:', error);
    response.status(500).json({ error: 'Error making API request' });
  });

  req.end();
});

app.listen(PORT, err => {
  if (err) console.log(err);
  else {
    console.log(`Server listening on port: ${PORT}`);
    console.log(`To Test:`);
    console.log(`http://localhost:3000/books?title=1984`);
    console.log(`http://localhost:3000`);
  }
});
