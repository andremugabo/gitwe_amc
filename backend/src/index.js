const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const hierarchyRoutes = require('./routes/hierarchyRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/training', trainingRoutes);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check
app.get('/', (req, res) => {
  res.send('Gitwe AMC API is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
