document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quoteForm');
  const quotesList = document.getElementById('quotesList');

  const fetchQuotes = async () => {
    const res = await fetch('/quotes');
    const quotes = await res.json();
    quotesList.innerHTML = '';
    
    quotes.forEach(quote => {
      const li = document.createElement('li');
      li.classList.add('quote-item');
      
      const quoteText = document.createElement('span');
      quoteText.textContent = `"${quote.quote}" - ${quote.author}`;
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('delete-btn');
      deleteButton.addEventListener('click', async () => {
        await fetch(`/quotes/${quote.id}`, { method: 'DELETE' });
        fetchQuotes();
      });

      li.appendChild(quoteText);
      li.appendChild(deleteButton);
      quotesList.appendChild(li);
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const quote = document.getElementById('quote').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const category = document.getElementById('category').value;

    await fetch('/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, author, year, category })
    });

    form.reset();
    fetchQuotes();
  });

  fetchQuotes();
});