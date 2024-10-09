const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Configure AWS SDK
AWS.config.update({
    region: 'us-east-1', // Replace with your AWS region
    // Credentials are automatically loaded from the environment or IAM role
});

// Create DynamoDB service object
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Route to display messages and a form to submit new ones
app.get('/', (req, res) => {
    const params = {
        TableName: 'Messages',
    };

    dynamoDb.scan(params, (err, data) => {
        if (err) {
            console.error("Error retrieving messages:", JSON.stringify(err, null, 2));
            res.status(500).send('Error retrieving messages');
        } else {
            const messages = data.Items;

            // Build HTML to display messages
            let html = `
              <h1>Message Board</h1>
              <ul>
            `;
            messages.forEach((message) => {
                html += `<li><strong>${message.Timestamp}</strong>: ${message.Content}</li>`;
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
        }
    });
});

// Route to handle new message submissions
app.post('/message', (req, res) => {
    const content = req.body.content;
    if (!content || content.trim() === '') {
        res.status(400).send('Message content cannot be empty');
        return;
    }

    // Prepare parameters for storing the message in DynamoDB
    const params = {
        TableName: 'Messages', // Replace with your DynamoDB table name
        Item: {
            MessageId: Date.now().toString(), // Use current timestamp as the ID
            Timestamp: new Date().toISOString(), // Store timestamp
            Content: content, // Store the message content
        },
    };

    // Store the message in DynamoDB
    dynamoDb.put(params, (err) => {
        if (err) {
            console.error("Error adding message:", JSON.stringify(err, null, 2));
            res.status(500).send('Error adding message');
        } else {
            res.redirect('/');
        }
    });
});

// Start the app and listen on the specified port
app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});