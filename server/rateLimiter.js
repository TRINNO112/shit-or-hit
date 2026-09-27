/**
 * ⚡ Precision Rate Limiting Engine: Sliding Window Counter & Token Bucket
 * 
 * Solves the "Fixed Window Boundary Spike" problem where a user bursts 2x the limit
 * across the boundary (e.g. 100 requests at 00:59 and 100 requests at 01:01).
 */

/**
 * 1. SLIDING WINDOW COUNTER (Weighted Rolling Window)
 * Combines previous window and current window with linear time decay weighting.
 * 
 * Formula:
 *   timeInCurrentWindow = (now - currentWindowStart)
 *   weight = 1 - (timeInCurrentWindow / windowMs)
 *   estimatedRequests = (previousWindowCount * weight) + currentWindowCount
 */
export class SlidingWindowLimiter {
  constructor({ windowMs = 60 * 1000, maxRequests = 100, name = 'default' }) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.name = name;
    this.store = new Map(); // key -> { currentWindow, currentCount, previousCount }
  }

  check(key) {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowMs) * this.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { currentWindow, currentCount: 0, previousCount: 0 };
    } else if (record.currentWindow !== currentWindow) {
      // Window has rolled forward
      const windowsPassed = Math.floor((currentWindow - record.currentWindow) / this.windowMs);
      if (windowsPassed === 1) {
        record.previousCount = record.currentCount;
      } else {
        record.previousCount = 0;
      }
      record.currentWindow = currentWindow;
      record.currentCount = 0;
    }

    const timePassedInWindow = now - currentWindow;
    const weight = Math.max(0, 1 - (timePassedInWindow / this.windowMs));
    const estimatedRequests = Math.round(record.previousCount * weight) + record.currentCount;

    if (estimatedRequests >= this.maxRequests) {
      const retryAfterSec = Math.ceil((this.windowMs - timePassedInWindow) / 1000);
      return {
        allowed: false,
        remaining: 0,
        estimatedRequests,
        retryAfterSec,
        resetTime: currentWindow + this.windowMs
      };
    }

    record.currentCount += 1;
    this.store.set(key, record);

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - estimatedRequests - 1),
      estimatedRequests: estimatedRequests + 1,
      retryAfterSec: 0,
      resetTime: currentWindow + this.windowMs
    };
  }

  reset(key) {
    this.store.delete(key);
  }

  // Periodic cleanup of stale entries to prevent memory growth
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.currentWindow > this.windowMs * 2) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * 2. TOKEN BUCKET (Burst Tolerance + Constant Refill Rate)
 * Permits short natural bursts up to `capacity`, but constrains sustained consumption
 * to `refillRatePerSec`.
 */
export class TokenBucketLimiter {
  constructor({ capacity = 10, refillRatePerSec = 0.5, name = 'token-bucket' }) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.name = name;
    this.buckets = new Map(); // key -> { tokens, lastRefill }
  }

  check(key, cost = 1) {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
    } else {
      // Calculate tokens accumulated since last refill
      const elapsedSec = (now - bucket.lastRefill) / 1000;
      const tokensToAdd = elapsedSec * this.refillRatePerSec;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      this.buckets.set(key, bucket);
      return {
        allowed: true,
        remainingTokens: Math.floor(bucket.tokens),
        retryAfterSec: 0
      };
    }

    // Not enough tokens
    const tokensNeeded = cost - bucket.tokens;
    const retryAfterSec = Math.ceil(tokensNeeded / this.refillRatePerSec);
    this.buckets.set(key, bucket);

    return {
      allowed: false,
      remainingTokens: 0,
      retryAfterSec
    };
  }

  reset(key) {
    this.buckets.delete(key);
  }
}

/**
 * Express Middleware Factory: Sliding Window
 */
export function slidingWindowMiddleware(options) {
  const limiter = new SlidingWindowLimiter(options);
  // Auto-cleanup stale memory every 10 minutes
  setInterval(() => limiter.cleanup(), 10 * 60 * 1000).unref();

  return (req, res, next) => {
    // Skip rate limits in test sandbox or playwright environments
    const isSandbox = req.headers['x-test-sandbox'] === 'true' || process.env.NODE_ENV === 'test';
    if (isSandbox) return next();

    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${options.name || 'api'}:${clientIp}`;

    const result = limiter.check(key);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfterSec);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || `Rate limit exceeded. Try again in ${result.retryAfterSec} seconds.`,
        retryAfterSec: result.retryAfterSec,
        type: 'SLIDING_WINDOW_EXCEEDED'
      });
    }

    next();
  };
}

/**
 * Express Middleware Factory: Token Bucket
 */
export function tokenBucketMiddleware(options) {
  const limiter = new TokenBucketLimiter(options);

  return (req, res, next) => {
    const isSandbox = req.headers['x-test-sandbox'] === 'true' || process.env.NODE_ENV === 'test';
    if (isSandbox) return next();

    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${options.name || 'bucket'}:${clientIp}`;

    const result = limiter.check(key);

    res.setHeader('X-RateLimit-Burst-Capacity', options.capacity);
    res.setHeader('X-RateLimit-Remaining-Tokens', result.remainingTokens);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfterSec);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || `Bucket depleted. Please pace your requests. Retry in ${result.retryAfterSec}s.`,
        retryAfterSec: result.retryAfterSec,
        type: 'TOKEN_BUCKET_EXHAUSTED'
      });
    }

    next();
  };
}
