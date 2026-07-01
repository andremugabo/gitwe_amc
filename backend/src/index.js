const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const hierarchyRoutes = require('./routes/hierarchyRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const { swaggerUi, swaggerSpec } = require('./utils/swagger');
const faqRoutes = require('./routes/faqRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/settings', settingsRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gitwe AMC API Docs'
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check
app.get('/', (req, res) => {
  res.send('Gitwe AMC API is running...');
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const http = require('http');
const { initWebSocket } = require('./utils/websocket');

const server = http.createServer(app);
initWebSocket(server);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
