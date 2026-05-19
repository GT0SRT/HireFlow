const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const logger = require('../utils/logger');
    logger.info('MongoDB Connected: %s', conn.connection.host);
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error('MongoDB connection error: %s', error && (error.message || error));
    process.exit(1);
  }
};

module.exports = connectDB;