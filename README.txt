Dotmally


Installation Instructions:

Navigate to the folder's path in the terminal.
Run npm install to install the modules listed in the package.json file.
Running Instructions:

Start the server by running npm start or node server.js.
To visit the website, go to http://localhost:3000/.
Additional Notes:

The server uses Express.js and SQLite.
It includes endpoints for user registration (/register), login (/login), adding books (/add-book), retrieving all books (/all-books), and searching for books using the Google Books API (/books).
The server normalizes URLs to lowercase and serves static files from a 'public' directory.
Ensure that the SQLite database file path is correctly set in server.js.

