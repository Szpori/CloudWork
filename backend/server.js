const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const PORT = process.env.PORT || 8080;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Serve static frontend files
const serveFile = (filePath, contentType, res) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Error serving file" }));
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    res.setHeader('Content-Type', 'application/json');

    // Serve frontend files
    if (req.method === 'GET' && pathname === '/') {
      serveFile(path.join(__dirname, '../frontend/index.html'), 'text/html', res);
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/app.js')) {
      serveFile(path.join(__dirname, '../frontend/app.js'), 'application/javascript', res);
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/styles.css')) {
      serveFile(path.join(__dirname, '../frontend/styles.css'), 'text/css', res);
      return;
    }

    // GET /quotes - Get all quotes from DB
    if (req.method === 'GET' && pathname === '/quotes') {
      try {
        const result = await pool.query('SELECT * FROM quotes');
        res.end(JSON.stringify(result.rows));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Error fetching quotes" }));
      }
    }

    // POST /quotes - Add a new quote
    else if (req.method === 'POST' && pathname === '/quotes') {
      try {
        const { quote, author, year, category } = JSON.parse(body);
        const result = await pool.query(
          'INSERT INTO quotes (quote, author, year, category) VALUES ($1, $2, $3, $4) RETURNING *',
          [quote, author, year || null, category || null]
        );
        res.end(JSON.stringify(result.rows[0]));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Error adding quote" }));
      }
    }

    // Default 404 for other routes
    else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
