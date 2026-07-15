#!/usr/bin/env node
/**
 * Generate an ADMIN_PASSWORD_HASH for .env.local.
 * Usage: npm run hash-password -- "your-password"
 */
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');

console.log('\nAdd this to your .env.local:\n');
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
