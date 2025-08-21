
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/auth', (req, res) => {
  res.send('API is running');
});

export default app;