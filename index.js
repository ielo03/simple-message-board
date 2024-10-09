const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 80;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory array to store messages
let messages = [];

// Route to display messages and submission form
app.get('/', (req, res) => {
    let html = `
    <h1>Message Board</h1>
    <ul>
  `;
    messages.forEach((message) => {
        html += `<li><strong>${message.timestamp}</strong>: ${message.content}</li>`;
    });
    html += `
    </ul>
    <h2>Submit a New Message</h2>
    <form action="/message" method="post">
      <textarea name="content" rows="4" cols="50"></textarea><br><br>
      <button type="submit">Submit</button>
    </form>
  `;
    res.send(html);
});

// Route to handle message submission
app.post('/message', (req, res) => {
    const content = req.body.content.trim();
    if (!content) {
        res.status(400).send('Message content cannot be empty');
        return;
    }

    const message = {
        timestamp: new Date().toISOString(),
        content: content,
    };

    messages.push(message);
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});