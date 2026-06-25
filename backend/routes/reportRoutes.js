import express from 'express';
import { exportMedicinesCsv, exportMedicinesExcel, getReportSummary } from '../controllers/reportController.js';

const router = express.Router();

router.get('/summary', getReportSummary);
router.get('/medicines/csv', exportMedicinesCsv);
router.get('/medicines/excel', exportMedicinesExcel);

export default router;
