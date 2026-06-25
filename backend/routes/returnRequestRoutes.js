import express from 'express';
import upload from '../config/multer.js';
import {
  createReturnRequest,
  getReturnRequests,
  getReturnRequestById,
  updateReturnRequest,
  deleteReturnRequest,
  patchReturnRequestStatus,
  getReturnSummary
} from '../controllers/returnRequestController.js';

const router = express.Router();

router.get('/summary', getReturnSummary);
router.get('/', getReturnRequests);
router.get('/:id', getReturnRequestById);
router.post('/', upload.array('images', 5), createReturnRequest);
router.put('/:id', upload.array('images', 5), updateReturnRequest);
router.patch('/:id/status', patchReturnRequestStatus);
router.delete('/:id', deleteReturnRequest);

export default router;
