import dotenv from 'dotenv';
import { startServer } from './server/server';

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = Number(process.env.PORT || 3000);

// Start the server
startServer(PORT)
  .then(() => {
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });