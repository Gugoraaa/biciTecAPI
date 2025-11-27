import { Router } from 'express';
import { handleTrip, getActiveTrip } from '../controller/tripController';

const router = Router();

router.post('/:uId/trip', handleTrip);
router.get('/:uId/active-trip', getActiveTrip);

export default router;
