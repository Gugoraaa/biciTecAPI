import { Router } from 'express';
import { handleTrip, getActiveTrip } from '../controller/tripController';

const router = Router();

// Start or end a trip
router.post('/:userId/trip', handleTrip);

// Get active trip for a user
router.get('/:userId/active-trip', getActiveTrip);

export default router;
