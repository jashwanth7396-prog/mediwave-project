import cron from 'node-cron';
import { generateMedicineAlerts } from '../utils/alertService.js';

export const expiryMonitorJob = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('[CRON] Running medicine alert generation at 9:00 AM...');
      await generateMedicineAlerts();
      console.log('[CRON] Medicine alert generation completed.');
    } catch (error) {
      console.error('[CRON] Medicine alert generation error:', error);
    }
  }, { scheduled: true, timezone: 'UTC' });
};
