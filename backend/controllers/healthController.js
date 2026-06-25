import mongoose from 'mongoose';

const mongoStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const healthCheck = (req, res) => {
  const mongoState = mongoose.connection.readyState;

  res.json({
    status: 'ok',
    database: mongoStates[mongoState] || 'unknown',
    timestamp: new Date().toISOString()
  });
};
