1. Start the Backend

Open a terminal in the backend/ folder:
cd backend


Install dependencies (first time only):
npm install


Start the server:
node server.js


Server runs on:
http://localhost:3000

2. API Endpoints

GET /docs → Returns all documentation items in JSON

Optional query parameters:
category → filter by category
search → filter by keyword in name or description

POST /rate/:name → Submit a helpful/not helpful vote

Example URL: /rate/Python

JSON body:

{ "helpful": true }

3. Files

server.js → backend code

data.csv → documentation dataset

ratings.json → stores persistent ratings (keep as {} initially)

4. Notes

Use HTTP, not HTTPS (http://localhost:3000).

Visiting / in a browser shows “Cannot GET /” — that’s normal.

Frontend should fetch /docs and /rate/:name to display data and submit ratings.




