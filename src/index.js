document.addEventListener("DOMContentLoaded", () => {
  const quoteList = document.getElementById("quote-list");
  const form = document.getElementById("new-quote-form");
  let sortByAuthor = false;

  // Load initial quotes
  fetchQuotes();

  // Fetch quotes
  function fetchQuotes() {
    const url = sortByAuthor
       ? "http://localhost:3000/quotes?_embed=likes&_sort=author"
       : "http://localhost:3000/quotes?_embed=likes";

    fetch(url)
      .then(res => res.json())
      .then(quotes => {
        quoteList.innerHTML = "";
        quotes.forEach(renderQuote);
      });
  }

  // Render a single quote
  function renderQuote(quote) {
    const li = document.createElement("li");
    li.className = "quote-card";
    li.dataset.id = quote.id;

    const blockquote = document.createElement("blockquote");
    blockquote.className = "blockquote";

    blockquote.innerHTML = `
      <p class="mb-0">${quote.quote}</p>
      <footer class="blockquote-footer">${quote.author}</footer>
      <br>
      <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
      <button class='btn-danger'>Delete</button>
      <button class='btn btn-warning'>Edit</button>
    `;

    // Like button
    const likeBtn = blockquote.querySelector(".btn-success");
    likeBtn.addEventListener("click", () => {
      fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quoteId: quote.id,
          createdAt: Math.floor(Date.now() / 1000)
        })
      })
        .then(res => res.json())
        .then(() => {
          const span = likeBtn.querySelector("span");
          span.textContent = parseInt(span.textContent) + 1;
        });
    });

    // Delete button
    const deleteBtn = blockquote.querySelector(".btn-danger");
    deleteBtn.addEventListener("click", () => {
      fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: "DELETE"
      }).then(() => li.remove());
    });

    // Edit button
    const editBtn = blockquote.querySelector(".btn-warning");
    editBtn.addEventListener("click", () => showEditForm(quote, li));

    li.appendChild(blockquote);
    quoteList.appendChild(li);
  }

  // New quote form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = document.getElementById("new-quote").value;
    const author = document.getElementById("author").value;

    fetch("http://localhost:3000/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quote: newQuote, author })
    })
      .then(res => res.json())
      .then(quote => {
        quote.likes = [];
        renderQuote(quote);
        form.reset();
      });
  });

  // Add sort toggle
  const sortBtn = document.createElement("button");
  sortBtn.className = "btn btn-secondary my-3";
  sortBtn.textContent = "Sort by Author";
  sortBtn.addEventListener("click", () => {
    sortByAuthor = !sortByAuthor;
    sortBtn.textContent = sortByAuthor ? "Sort by ID" : "Sort by Author";
    fetchQuotes();
  });
  document.body.insertBefore(sortBtn, document.querySelector("hr"));

  // Edit form functionality
  function showEditForm(quote, li) {
    const form = document.createElement("form");
    form.innerHTML = `
      <div class="form-group">
        <input type="text" class="form-control" value="${quote.quote}">
        <input type="text" class="form-control" value="${quote.author}">
        <button type="submit" class="btn btn-sm btn-primary mt-2">Save</button>
      </div>
    `;
    li.querySelector(".blockquote").replaceWith(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const updatedQuote = form.querySelectorAll("input")[0].value;
      const updatedAuthor = form.querySelectorAll("input")[1].value;

      fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quote: updatedQuote, author: updatedAuthor })
      })
        .then(res => res.json())
        .then(updated => {
          updated.likes = quote.likes;
          li.innerHTML = "";
          renderQuote(updated);
        });
    });
  }
});
