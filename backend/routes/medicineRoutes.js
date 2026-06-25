import express from 'express';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getSummary
} from '../controllers/medicineController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/', getMedicines);
router.post('/', createMedicine);
router.get('/:id', getMedicineById);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
