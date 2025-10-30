require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
// const PORT = process.env.PORT || 5000;for supa
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Routes import 
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const tutorRoutes = require('./routes/tutors');
const adminRoutes = require('./routes/admin');
const tutorRequestRoutes = require('./routes/tutorRequests');


// Routes use 
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutor-requests', tutorRequestRoutes);




// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

