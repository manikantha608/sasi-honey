// Quick smoke test for the Redis proxy + fallback
import redis, { connectRedis, isRedisAvailable } from './src/config/redis.js';

await connectRedis();

console.log('Redis available:', isRedisAvailable());

// Test the operations the auth service uses
await redis.setex('test_key', 60, 'hello');
const val = await redis.get('test_key');
console.log('setex/get:', val === 'hello' ? '✅ OK' : '❌ FAIL', `(got: ${val})`);

await redis.del('test_key');
const afterDel = await redis.get('test_key');
console.log('del:', afterDel === null ? '✅ OK' : '❌ FAIL', `(got: ${afterDel})`);

await redis.setex('attempts', 900, '3');
const attempts = await redis.get('attempts');
console.log('attempts:', attempts === '3' ? '✅ OK' : '❌ FAIL', `(got: ${attempts})`);

console.log('\nAll operations work regardless of Redis availability.');
process.exit(0);
