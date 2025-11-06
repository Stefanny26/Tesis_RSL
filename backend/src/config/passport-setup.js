const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuthLoginUseCase = require('../domain/use-cases/oauth-login.use-case');

/**
 * Configuración de Passport para Google OAuth
 */
function setupPassport() {
  // Verificar credenciales
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Credenciales de Google OAuth no configuradas.');
    console.warn('   Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env');
    return;
  }

  // Estrategia de Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Autenticación OAuth recibida:', profile.id);

          const oauthLoginUseCase = new OAuthLoginUseCase();
          const result = await oauthLoginUseCase.execute(profile);

          return done(null, result);
        } catch (error) {
          console.error('❌ Error en OAuth:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialización (no la usamos con JWT, pero es requerida)
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  console.log('✅ Passport configurado con Google OAuth');
}

module.exports = setupPassport;
