const ipRequestLimit = (limitTime, maxRequestsPerMinute) => {
    const ipRequests = new Map();
  
    return (req, res, next) => {
      const ip = req.ip;
  
      if (!ipRequests.has(ip)) {
        ipRequests.set(ip, { count: 1, timestamp: Date.now() });
      } else {
        const requestInfo = ipRequests.get(ip);
        const currentTime = Date.now();
        const IntervalsTime = currentTime - requestInfo.timestamp;
  
        if (IntervalsTime > limitTime) {
          requestInfo.count = 1;
          requestInfo.timestamp = currentTime;
        } else {
          requestInfo.count++;
        }
  
        const coolingTime = limitTime - IntervalsTime;
        if (requestInfo.count > maxRequestsPerMinute) {
          return res.status(429).json({ error: Math.floor(coolingTime / 1000) });
        }
      }
  
      next();
    };
  };
  
  module.exports = ipRequestLimit;
  