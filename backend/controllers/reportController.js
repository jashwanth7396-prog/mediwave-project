import Medicine from '../models/Medicine.js';
import DamagedStock from '../models/DamagedStock.js';
import ReturnRequest from '../models/ReturnRequest.js';
import { exportToCsv, exportToExcel } from '../utils/reportUtils.js';

const parseRange = (range) => {
  const now = new Date();
  const end = now;
  let start = null;

  if (range === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === '7d') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (range === '30d') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  }

  return { start, end };
};

const buildInventoryTrend = (range) => {
  const now = new Date();
  if (range === 'today') {
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), index);
      return { label: date.toLocaleTimeString([], { hour: 'numeric', hour12: true }), key: date.toISOString().slice(0, 13) };
    });
  }

  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30;
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - index));
      return { label: date.toLocaleDateString([], { month: 'short', day: 'numeric' }), key: date.toISOString().slice(0, 10) };
    });
  }

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { label: date.toLocaleString('default', { month: 'short' }), key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` };
  });
};

export const getReportSummary = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;
    const { start, end } = parseRange(range);

    const matchFilter = start ? { createdAt: { $gte: start, $lte: end } } : {};

    const inventoryAggregate = await Medicine.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          totalMedicines: [{ $count: 'count' }],
          lowStock: [{ $match: { stockStatus: 'Low Stock' } }, { $count: 'count' }],
          expired: [{ $match: { status: 'Expired' } }, { $count: 'count' }],
          expiringSoon: [{ $match: { status: 'Expiring Soon' } }, { $count: 'count' }],
          totalInventoryValue: [{ $group: { _id: null, value: { $sum: { $multiply: ['$price', '$quantity'] } } } }]
        }
      }
    ]);

    const inventorySummary = inventoryAggregate[0] || {};
    const formatCount = (items) => (items.length > 0 ? items[0].count : 0);
    const totalInventoryValue = inventorySummary.totalInventoryValue?.[0]?.value || 0;

    const damageAggregation = await DamagedStock.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          totalDamagedStock: [{ $group: { _id: null, total: { $sum: '$damagedQuantity' } } }],
          mostDamagedMedicine: [
            { $group: { _id: '$medicineName', total: { $sum: '$damagedQuantity' } } },
            { $sort: { total: -1 } },
            { $limit: 1 }
          ],
          damageReasonDistribution: [
            { $group: { _id: '$reason', total: { $sum: '$damagedQuantity' } } },
            { $sort: { total: -1 } }
          ]
        }
      }
    ]);

    const damagedSummary = damageAggregation[0] || {};
    const totalDamagedStock = damagedSummary.totalDamagedStock?.[0]?.total || 0;
    const mostDamagedItem = damagedSummary.mostDamagedMedicine?.[0] || null;
    const damageReasonDistribution = (damagedSummary.damageReasonDistribution || []).map((item) => ({ reason: item._id, value: item.total }));

    const returnAggregation = await ReturnRequest.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          statusDistribution: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          totalRequests: [{ $count: 'count' }]
        }
      }
    ]);

    const returnSummary = returnAggregation[0] || {};
    const statusCounts = returnSummary.statusDistribution?.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}) || {};

    const now = new Date();
    const allMedicines = await Medicine.find().lean();
    const lowStockMedicines = allMedicines.filter((m) => m.quantity <= 10);
    const expiringMedicines = allMedicines.filter((m) => {
      const exp = new Date(m.expiryDate);
      const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return days <= 30 && days > 0;
    });
    const expiredMedicines = allMedicines.filter((m) => new Date(m.expiryDate) <= now);

    const inventoryTrendBuckets = buildInventoryTrend(range);
    const trendMatch = { ...matchFilter };
    const dateGroup = range === 'all'
      ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
      : range === 'today'
        ? { $dateToString: { format: '%Y-%m-%dT%H', date: '$createdAt' } }
        : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    const inventoryTrendAggregation = await Medicine.aggregate([
      { $match: trendMatch },
      {
        $group: {
          _id: dateGroup,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    const trendMap = inventoryTrendAggregation.reduce((acc, item) => {
      acc[item._id] = item.totalValue;
      return acc;
    }, {});

    const inventoryTrend = inventoryTrendBuckets.map((bucket) => ({
      label: bucket.label,
      value: trendMap[bucket.key] || 0
    }));

    res.json({
      inventorySummary: {
        totalMedicines: formatCount(inventorySummary.totalMedicines),
        lowStock: formatCount(inventorySummary.lowStock),
        expiredMedicines: formatCount(inventorySummary.expired),
        expiringSoon: formatCount(inventorySummary.expiringSoon),
        totalInventoryValue
      },
      alertSummary: {
        lowStockCount: lowStockMedicines.length,
        expiringCount: expiringMedicines.length,
        expiredCount: expiredMedicines.length,
        lowStockMedicines: lowStockMedicines.map((m) => ({ name: m.medicineName, quantity: m.quantity })),
        expiringMedicines: expiringMedicines.map((m) => ({ name: m.medicineName, expiryDate: m.expiryDate })),
        expiredMedicines: expiredMedicines.map((m) => ({ name: m.medicineName, expiryDate: m.expiryDate }))
      },
      damagedStockSummary: {
        totalDamagedStock,
        mostDamagedMedicine: mostDamagedItem ? { name: mostDamagedItem._id, quantity: mostDamagedItem.total } : null,
        damageReasonDistribution
      },
      returnRequestSummary: {
        totalRequests: formatCount(returnSummary.totalRequests),
        pending: statusCounts.Pending || 0,
        approved: statusCounts.Approved || 0,
        rejected: statusCounts.Rejected || 0,
        completed: statusCounts.Completed || 0,
        statusDistribution: (returnSummary.statusDistribution || []).map((item) => ({ status: item._id, count: item.count }))
      },
      chartData: {
        returnStatus: (returnSummary.statusDistribution || []).map((item) => ({ name: item._id, value: item.count })),
        damageReasons: damageReasonDistribution,
        inventoryTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportMedicinesCsv = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    const csv = exportToCsv(medicines);
    res.header('Content-Type', 'text/csv');
    res.attachment('medicines.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportMedicinesExcel = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    const excel = exportToExcel(medicines);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('medicines.xlsx');
    res.send(excel);
  } catch (error) {
    next(error);
  }
};
