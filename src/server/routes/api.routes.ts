import { Router } from 'express';
import { setupController } from '../controllers/setup.controller';
import { queryController } from '../controllers/query.controller';

// Create router
const router = Router();

// Define API routes
router.post('/setup-form', setupController);
router.post('/submit-query', queryController);

export default router;