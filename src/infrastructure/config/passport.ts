import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import AppleStrategy, { Profile as AppleProfile } from "passport-apple";
import { IUser, User } from "../database/mongoose/User";

// ======================
// Serialização do usuário
// ======================
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error as any, null);
  }
});

// ======================
// Estratégia do Google
// ======================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: IUser | false) => void
    ) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails?.[0].value,
        });
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err as any, false);
      }
    }
  )
);

// ======================
// Estratégia da Apple
// ======================

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID!,
//       teamID: process.env.APPLE_TEAM_ID!,
//       keyID: process.env.APPLE_KEY_ID!,
//       privateKeyString: process.env.APPLE_PRIVATE_KEY!,
//       callbackURL: "/api/auth/apple/callback",
//     },
//     async (
//       req: any,
//       accessToken: string,
//       refreshToken: string,
//       profile: AppleProfile,
//       done: (error: any, user?: IUser | false) => void
//     ) => {
//       try {
//         let user = await User.findOne({ appleId: profile.id });

//         if (user) return done(null, user);

//         user = new User({
//           appleId: profile.id,
//           email: profile.email || "apple_relay_email",
//         });
//         await user.save();

//         return done(null, user);
//       } catch (err) {
//         return done(err as any, false);
//       }
//     }
//   )
// );

export default passport;
