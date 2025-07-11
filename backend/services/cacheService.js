// Memory cache fallback
const memoryCache = new Map();
let isRedisAvailable = false;
let client = null;

// محاولة الاتصال بـ Redis
try {
  const redis = require('redis');

  client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    retry_strategy: function(options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        console.log('Redis connection refused - using memory cache');
        return false; // لا تعيد المحاولة
      }
      if (options.attempt > 3) {
        console.log('Redis max attempts reached - using memory cache');
        return false;
      }
      return Math.min(options.attempt * 100, 3000);
    }
  });

  // معالجة أحداث Redis
  client.on('error', (error) => {
    console.log('Redis error - falling back to memory cache:', error.message);
    isRedisAvailable = false;
  });

  client.on('connect', () => {
    console.log('Connected to Redis successfully');
    isRedisAvailable = true;
  });

  client.on('ready', () => {
    console.log('Redis client ready');
    isRedisAvailable = true;
  });

  client.on('end', () => {
    console.log('Redis connection ended - using memory cache');
    isRedisAvailable = false;
  });

} catch (error) {
  console.log('Redis module not available - using memory cache:', error.message);
  isRedisAvailable = false;
}

// وظائف مساعدة للتعامل مع Cache
const getAsync = async (key) => {
  if (isRedisAvailable && client) {
    try {
      return await new Promise((resolve, reject) => {
        client.get(key, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      console.log('Redis get error - using memory cache:', error.message);
      return memoryCache.get(key) || null;
    }
  }
  return memoryCache.get(key) || null;
};

const setAsync = async (key, value, mode, expiry) => {
  if (isRedisAvailable && client) {
    try {
      return await new Promise((resolve, reject) => {
        if (mode === 'EX' && expiry) {
          client.setex(key, expiry, value, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        } else {
          client.set(key, value, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        }
      });
    } catch (error) {
      console.log('Redis set error - using memory cache:', error.message);
      memoryCache.set(key, value);
      if (mode === 'EX' && expiry) {
        setTimeout(() => memoryCache.delete(key), expiry * 1000);
      }
      return 'OK';
    }
  }
  memoryCache.set(key, value);
  if (mode === 'EX' && expiry) {
    setTimeout(() => memoryCache.delete(key), expiry * 1000);
  }
  return 'OK';
};

const delAsync = async (key) => {
  if (isRedisAvailable && client) {
    try {
      return await new Promise((resolve, reject) => {
        client.del(key, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      console.log('Redis del error - using memory cache:', error.message);
      return memoryCache.delete(key) ? 1 : 0;
    }
  }
  return memoryCache.delete(key) ? 1 : 0;
};

const flushAsync = async () => {
  if (isRedisAvailable && client) {
    try {
      return await new Promise((resolve, reject) => {
        client.flushall((err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      console.log('Redis flush error - using memory cache:', error.message);
      memoryCache.clear();
      return 'OK';
    }
  }
  memoryCache.clear();
  return 'OK';
};

/**
 * الحصول على قيمة من التخزين المؤقت
 * @param {string} key - مفتاح التخزين المؤقت
 * @returns {Promise<any>} - القيمة المخزنة مؤقتًا
 */
const get = async (key) => {
  try {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * تخزين قيمة في التخزين المؤقت
 * @param {string} key - مفتاح التخزين المؤقت
 * @param {any} value - القيمة المراد تخزينها
 * @param {number} expiry - مدة انتهاء الصلاحية بالثواني (اختياري)
 * @returns {Promise<boolean>} - نجاح العملية
 */
const set = async (key, value, expiry = 3600) => {
  try {
    const stringValue = JSON.stringify(value);
    if (expiry) {
      await setAsync(key, stringValue, 'EX', expiry);
    } else {
      await setAsync(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * حذف قيمة من التخزين المؤقت
 * @param {string} key - مفتاح التخزين المؤقت
 * @returns {Promise<boolean>} - نجاح العملية
 */
const del = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * مسح جميع القيم من التخزين المؤقت
 * @returns {Promise<boolean>} - نجاح العملية
 */
const flush = async () => {
  try {
    await flushAsync();
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
};

/**
 * وظيفة وسيطة للتخزين المؤقت للاستعلامات
 * @param {string} prefix - بادئة مفتاح التخزين المؤقت
 * @param {number} expiry - مدة انتهاء الصلاحية بالثواني
 * @returns {Function} - وظيفة وسيطة Express
 */
const cacheMiddleware = (prefix, expiry = 3600) => {
  return async (req, res, next) => {
    // تجاهل التخزين المؤقت للطلبات غير GET
    if (req.method !== 'GET') {
      return next();
    }

    // إنشاء مفتاح التخزين المؤقت
    const key = `${prefix}:${req.originalUrl}`;

    try {
      // محاولة الحصول على البيانات من التخزين المؤقت
      const cachedData = await get(key);

      if (cachedData) {
        // إذا وجدت البيانات في التخزين المؤقت، أعدها
        return res.json(cachedData);
      }

      // تخزين وظيفة res.json الأصلية
      const originalJson = res.json;

      // استبدال وظيفة res.json لتخزين النتيجة في التخزين المؤقت
      res.json = function(data) {
        // استعادة وظيفة res.json الأصلية
        res.json = originalJson;

        // تخزين البيانات في التخزين المؤقت
        set(key, data, expiry);

        // استدعاء وظيفة res.json الأصلية
        return res.json(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * إنشاء مفتاح تخزين مؤقت
 * @param {string} prefix - بادئة المفتاح
 * @param {Object} params - معلمات المفتاح
 * @returns {string} - مفتاح التخزين المؤقت
 */
const createKey = (prefix, params) => {
  const paramsString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${prefix}:${paramsString}`;
};

module.exports = {
  get,
  set,
  del,
  flush,
  cacheMiddleware,
  createKey,
  client
};
