// backend/src/middlewares/logger.js
const fs = require('fs');
const path = require('path');

const systemLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;

    const logMessage = `[${timestamp}] IP: ${ip} | Method: ${method} | URL: ${url}`;
    
    // In log ra màn hình console (rất trực quan khi demo)
    console.log(`\x1b[36m[SYSTEM LOG]\x1b[0m ${logMessage}`);

    // Ghi log vào file (nếu cần show file text cho hội đồng xem)
    const logFilePath = path.join(__dirname, '../../system-access.log');
    fs.appendFile(logFilePath, logMessage + '\n', (err) => {
        if (err) console.error('Lỗi khi ghi log file:', err);
    });

    next();
};

module.exports = systemLogger;