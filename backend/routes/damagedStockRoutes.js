import express from 'express';
import {
  createDamagedStock,
  getDamagedStocks,
  getDamagedStockById,
  updateDamagedStock,
  deleteDamagedStock,
  getDamagedStockSummary
} from '../controllers/damagedStockController.js';

const router = express.Router();

router.get('/summary', getDamagedStockSummary);
router.get('/', getDamagedStocks);
router.get('/:id', getDamagedStockById);
router.post('/', createDamagedStock);
router.put('/:id', updateDamagedStock);
router.delete('/:id', deleteDamagedStock);

export default router;
