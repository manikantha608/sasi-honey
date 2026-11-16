import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Passport Google OAuth 2.0 strategy.
 * We do NOT use passport sessions — we issue our own JWT pair after the callback.
 * The verify callback just passes the profile through; actual DB upsert happens
 * in auth.service.handleGoogleCallback (called from the controller).
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: false,
    },
    // verify callback — just hand the profile to Express
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// No serialization needed since we're not using passport sessions
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
