import dotenv from 'dotenv';
import { createServer } from './server/server';

// Load environment variables
dotenv.config();

// Create the server app
const app = createServer();

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}