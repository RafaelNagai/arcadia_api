const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// A lógica de serialização é opcional para JWT, mas é boa prática
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Estratégia do Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" // Sua rota de callback
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Encontre o usuário pelo Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Se o usuário existir, retorne-o
            return done(null, user);
        } else {
            // Se não, crie um novo usuário
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
            return done(null, user);
        }
    } catch (err) {
      return done(err, false);
    }
  }
));

// Estratégia da Apple (simplificada, exige mais configuração)
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyIdentifier: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY, // A chave privada da Apple
    callbackURL: "/api/auth/apple/callback"
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // A lógica de encontrar/criar o usuário é similar à do Google
    try {
        let user = await User.findOne({ appleId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            user = new User({
                appleId: profile.id,
                // A Apple pode não fornecer o email real, use o email de relay
                email: profile.email || 'apple_relay_email', 
            });
            await user.save();
            return done(null, user);
        }
    } catch (err) {
        return done(err, false);
    }
  }
));

module.exports = passport;