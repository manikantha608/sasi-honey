import jwt from 'jsonwebtoken';
import { generateToken } from './crypto.js';

/**
 * Generate a short-lived access token (default 15m).
 * Payload: { id, email, role }
 */
export const generateAccessToken = (payload) =>
  jwt.sign(
    { ...payload, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      issuer: 'sasi-honey',
      audience: 'sasi-honey-client',
      jwtid: generateToken(8), // unique token ID for blacklisting if needed
    }
  );

/**
 * Generate a long-lived refresh token (default 7d).
 * Never sent to the client as a readable JWT value — stored as an HttpOnly cookie.
 */
export const generateRefreshToken = (payload) =>
  jwt.sign(
    { ...payload, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'sasi-honey',
      jwtid: generateToken(8),
    }
  );

/**
 * Verify and decode a refresh token.
 * Throws if invalid or expired.
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: 'sasi-honey',
  });

/**
 * Verify and decode an access token.
 * Throws if invalid or expired.
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: 'sasi-honey',
    audience: 'sasi-honey-client',
  });

/**
 * Decode a JWT without verifying signature.
 * Useful for extracting the payload to read expiry etc.
 * DO NOT use for authentication — always verify first.
 */
export const decodeToken = (token) => jwt.decode(token);
