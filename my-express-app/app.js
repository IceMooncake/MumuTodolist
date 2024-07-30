const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const { PORT, SSH_PATH, isOnServer } = require('./config');
const authRoutes = require('./routes/authRoutes');
const taskListRoutes = require('./routes/taskListRoutes');
const repeatTaskRoutes = require('./routes/repeatTaskRoutes');
require('./execute/repeatTaskPerDay');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', authRoutes);
app.use('/api', taskListRoutes);
app.use('/api', repeatTaskRoutes);

if (isOnServer == 1) {
  const server = https.createServer({
    key: fs.readFileSync(SSH_PATH + 'privkey.pem'),
    cert: fs.readFileSync(SSH_PATH + 'fullchain.pem')
  }, app);

  server.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
