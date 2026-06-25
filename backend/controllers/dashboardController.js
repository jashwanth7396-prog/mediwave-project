import Medicine from '../models/Medicine.js';
import DamagedStock from '../models/DamagedStock.js';
import ReturnRequest from '../models/ReturnRequest.js';
import Notification from '../models/Notification.js';

const buildLastSixMonths = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      name: date.toLocaleString('default', { month: 'short' }),
      stock: 0,
      returns: 0
    };
  });
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const lowStock = await Medicine.countDocuments({ stockStatus: 'Low Stock' });
    const expired = await Medicine.countDocuments({ status: 'Expired' });
    const expiringSoon = await Medicine.countDocuments({ status: 'Expiring Soon' });
    const damagedStockCount = await DamagedStock.countDocuments();
    const totalReturnRequests = await ReturnRequest.countDocuments();
    const totalNotifications = await Notification.countDocuments({ user: req.user.id });
    const unreadNotifications = await Notification.countDocuments({ user: req.user.id, read: false });

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const medicineMonthly = await Medicine.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          quantity: '$quantity'
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const returnMonthly = await ReturnRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalRequests: { $sum: 1 }
        }
      }
    ]);

    const chartData = buildLastSixMonths();
    const chartKey = (entry) => `${entry.year}-${entry.month}`;
    const chartMap = chartData.reduce((acc, item) => {
      acc[chartKey(item)] = item;
      return acc;
    }, {});

    medicineMonthly.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (chartMap[key]) {
        chartMap[key].stock = item.totalQuantity;
      }
    });

    returnMonthly.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (chartMap[key]) {
        chartMap[key].returns = item.totalRequests;
      }
    });

    res.json({
      totalMedicines,
      lowStock,
      expired,
      expiringSoon,
      damagedStockCount,
      totalReturnRequests,
      totalNotifications,
      unreadNotifications,
      chartData: Object.values(chartMap)
    });
  } catch (error) {
    next(error);
  }
};
