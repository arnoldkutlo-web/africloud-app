
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const multipartRoutes = require('./routes/multipart');
const versionRoutes = require('./routes/versions');
const shareRoutes = require('./routes/share');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/multipart', multipartRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/share', shareRoutes);

const PORT = process.env.PORT || 4000;
sequelize.authenticate().then(() => {
  console.log('Database connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Unable to connect to DB:', err);
});
