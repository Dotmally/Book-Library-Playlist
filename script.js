
// Initiating a book search request using the entered title and displays the results.
// Initiating a book search request using the entered title and displays the results.
function getBook() {
  let bookTitle = document.getElementById('bookTitleTextField').value.trim();
  console.log('bookTitle: ' + bookTitle);
  if (bookTitle === '') {
    return alert('Please enter a Book Title');
  }

  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let response = JSON.parse(xhr.responseText);
      displayBooks(response.items, bookTitle); // Adjusted to handle book items
    }
  };
  xhr.open('GET', `/books?title=${bookTitle}`, true);
  xhr.send();
}

function showRegister() {
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('register-area').style.display = 'block';
}

// Function to toggle to the login form
function showLogin() {
  document.getElementById('login-area').style.display = 'block';
  document.getElementById('register-area').style.display = 'none';
}


function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  // Send AJAX request for login
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/login', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
          if (xhr.status == 200) {
              // Handle successful login
              alert('Login successful');
              // Additional logic for successful login
          } else {
              // Handle login error
              alert('Login failed: ' + xhr.responseText);
          }
      }
  };
  xhr.send(JSON.stringify({ username, password }));
}

// Function to handle the registration form submission
function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  // Send AJAX request for registration
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/register', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
          if (xhr.status == 200) {
              // Handle successful registration
              alert('Registration successful');
              // Additional logic for successful registration
          } else {
              // Handle registration error
              alert('Registration failed: ' + xhr.responseText);
          }
      }
  };
  xhr.send(JSON.stringify({ username, password }));
}


// Creating HTML elements to display a list of books with buttons to add them to a list.
function displayBooks(books, title) {
  let tableBody = document.getElementById('search-results-table').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // Clear existing rows

  books.forEach(book => {
      const bookInfo = book.volumeInfo;
      const thumbnail = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : 'path/to/default/image.jpg'; // Path to a default image
      let newRow = tableBody.insertRow();

      newRow.insertCell(0).textContent = bookInfo.title; // Title
      newRow.insertCell(1).textContent = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author'; // Authors
      newRow.insertCell(2).innerHTML = `<img src="${thumbnail}" alt="Book cover" style="width:50px;height:75px;">`; // Cover

      // Add Button
      let actionCell = newRow.insertCell(3);
      actionCell.innerHTML = `<button onclick="addToBookList('${bookInfo.title}', '${bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author'}', '${thumbnail}')">Add to List</button>`;
  });
}



function addToBookList(title, authors, coverUrl) {
  let bookListTable = document.getElementById('bookList-table').getElementsByTagName('tbody')[0];
  let newRow = bookListTable.insertRow();

  let actionsCell = newRow.insertCell(0);
  actionsCell.innerHTML = `
    <button onclick="removeFromBookList(this)">-</button>
    <button onclick="moveBook(this, -1)">↑</button>
    <button onclick="moveBook(this, 1)">↓</button>
  `;

  newRow.insertCell(1).textContent = title;
  newRow.insertCell(2).textContent = authors;
  newRow.insertCell(3).innerHTML = `<img src="${coverUrl}" alt="Book cover" style="width:50px;height:75px;">`; // Adjust the image size as needed

  saveBookList();
}



const ENTER = 13;

function handleKeyUp(event) {
  event.preventDefault();
  if (event.keyCode === ENTER) {
      document.getElementById("submit_button").click();
  }
}

function removeFromBookList(button) {
  let row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

function moveBook(button, direction) {
  let row = button.parentNode.parentNode;
  let index = row.rowIndex;
  let table = document.getElementById('bookList-table');

  if (direction === -1 && index > 1) {
    table.deleteRow(index);
    table.tBodies[0].insertBefore(row, table.rows[index - 1]);
  } else if (direction === 1 && index < table.rows.length - 1) {
    table.deleteRow(index);
    table.tBodies[0].insertBefore(row, table.rows[index + 1]);
  }
}

function loadBookList() {
  const savedBookList = JSON.parse(localStorage.getItem('bookList')) || [];
  console.log('Loaded Book List:', savedBookList);

  let bookListTable = document.getElementById('bookList-table').getElementsByTagName('tbody')[0];
  bookListTable.innerHTML = ''; // Clear the existing table content

  savedBookList.forEach(book => {
    let newRow = bookListTable.insertRow();
    
    let actionsCell = newRow.insertCell(0);
    actionsCell.innerHTML = `
        <button onclick="removeFromBookList(this)">-</button>
        <button onclick="moveBook(this, -1)">↑</button>
        <button onclick="moveBook(this, 1)">↓</button>
    `;

    newRow.insertCell(1).textContent = book.title;
    newRow.insertCell(2).textContent = book.authors;
    newRow.insertCell(3).innerHTML = `<img src="${book.coverUrl}" alt="Book cover" style="width:50px;height:75px;">`; // Adding the cover image
  });
}



// This will save the list by title, authors
function saveBookList() {
  const currentBookList = [];
  let bookListTable = document.getElementById('bookList-table').getElementsByTagName('tbody')[0];
  
  for (let i = 0; i < bookListTable.rows.length; i++) {
    let row = bookListTable.rows[i];
    let title = row.cells[1].textContent;
    let authors = row.cells[2].textContent;
    let coverUrl = row.cells[3].querySelector('img').src; // Get the src attribute of the img element

    currentBookList.push({ title, authors, coverUrl });
  }

  localStorage.setItem('bookList', JSON.stringify(currentBookList));
}


document.addEventListener('DOMContentLoaded', function() {
  const submitButton = document.getElementById('submit_button');
  const loginForm = document.getElementById('login-form');
  const registrationForm = document.getElementById('registration-form');

  if (submitButton) {
    submitButton.addEventListener('click', getBook);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegister);
  }

  document.addEventListener('keyup', handleKeyUp);
  loadBookList();
});

