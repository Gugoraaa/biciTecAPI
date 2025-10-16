import { Router } from 'express';
import { handleTrip, getActiveTrip } from '../controller/tripController';

const router = Router();

router.post('/:userId/trip', handleTrip);
router.get('/:userId/active-trip', getActiveTrip);

export default router;
