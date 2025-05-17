const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// In-memory data store
let quotes = [];
let currentId = 1;

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

    // GET /quotes - Get all quotes
    if (req.method === 'GET' && pathname === '/quotes') {
      res.end(JSON.stringify(quotes));
    }

    // POST /quotes - Add a new quote
    else if (req.method === 'POST' && pathname === '/quotes') {
      try {
        const { quote, author, year, category } = JSON.parse(body);
        if (!quote || !author) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Quote and author are required" }));
          return;
        }
        const newQuote = { id: currentId++, quote, author, year: year || null, category: category || null };
        quotes.push(newQuote);
        res.end(JSON.stringify(newQuote));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    }

    // GET /quotes/:id - Get a specific quote
    else if (req.method === 'GET' && pathname.startsWith('/quotes/')) {
      const id = parseInt(pathname.split('/')[2], 10);
      const quote = quotes.find(q => q.id === id);
      if (!quote) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Quote not found" }));
      } else {
        res.end(JSON.stringify(quote));
      }
    }

    // DELETE /quotes/:id - Delete a specific quote
    else if (req.method === 'DELETE' && pathname.startsWith('/quotes/')) {
      const id = parseInt(pathname.split('/')[2], 10);
      const index = quotes.findIndex(q => q.id === id);
      if (index === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Quote not found" }));
      } else {
        quotes.splice(index, 1);
        res.end(JSON.stringify({ message: `Quote ${id} deleted` }));
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
