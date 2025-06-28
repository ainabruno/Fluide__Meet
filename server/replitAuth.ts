// server/googleAuth.ts

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// ✅ Middleware pour vérifier si l'utilisateur est connecté
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated?.() && req.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// ✅ Middleware pour initialiser la session
export function setupSession(app: Express) {
  const pgStore = connectPg(session);
  app.set("trust proxy", 1); // Important pour Render

  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Important : true en prod
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semaine
    },
  }));
}

// ✅ Middleware pour configurer Google OAuth
export function setupGoogleAuth(app: Express) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails?.[0].value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      profileImageUrl: profile.photos?.[0].value,
    };

    await storage.upsertUser(user); // À adapter à ton système
    done(null, user);
  }));

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));

  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ Point d’entrée vers Google
  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    accessType: "offline"
  }));

  // ✅ Callback après login
  app.get("/api/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "/",
  }));

  // ✅ Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

// import * as client from "openid-client";
// import { Strategy, type VerifyFunction } from "openid-client/passport";

// import passport from "passport";
// import session from "express-session";
// import type { Express, RequestHandler } from "express";
// import memoize from "memoizee";
// import connectPg from "connect-pg-simple";
// import { storage } from "./storage";

// if (!process.env.REPLIT_DOMAINS) {
//   throw new Error("Environment variable REPLIT_DOMAINS not provided");
// }

// const getOidcConfig = memoize(
//   async () => {
//     return await client.discovery(
//       new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
//       process.env.REPL_ID!
//     );
//   },
//   { maxAge: 3600 * 1000 }
// );

// export function getSession() {
//   const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
//   const pgStore = connectPg(session);
//   const sessionStore = new pgStore({
//     conString: process.env.DATABASE_URL,
//     createTableIfMissing: false,
//     ttl: sessionTtl,
//     tableName: "sessions",
//   });
//   return session({
//     secret: process.env.SESSION_SECRET!,
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: true,
//       maxAge: sessionTtl,
//     },
//   });
// }

// function updateUserSession(
//   user: any,
//   tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
// ) {
//   user.claims = tokens.claims();
//   user.access_token = tokens.access_token;
//   user.refresh_token = tokens.refresh_token;
//   user.expires_at = user.claims?.exp;
// }

// async function upsertUser(
//   claims: any,
// ) {
//   await storage.upsertUser({
//     id: claims["sub"],
//     email: claims["email"],
//     firstName: claims["first_name"],
//     lastName: claims["last_name"],
//     profileImageUrl: claims["profile_image_url"],
//   });
// }

// export async function setupAuth(app: Express) {
//   app.set("trust proxy", 1);
//   app.use(getSession());
//   app.use(passport.initialize());
//   app.use(passport.session());

//   const config = await getOidcConfig();

//   const verify: VerifyFunction = async (
//     tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
//     verified: passport.AuthenticateCallback
//   ) => {
//     const user = {};
//     updateUserSession(user, tokens);
//     await upsertUser(tokens.claims());
//     verified(null, user);
//   };

//   for (const domain of process.env
//     .REPLIT_DOMAINS!.split(",")) {
//     const strategy = new Strategy(
//       {
//         name: `replitauth:${domain}`,
//         config,
//         scope: "openid email profile offline_access",
//         callbackURL: `https://${domain}/api/callback`,
//       },
//       verify,
//     );
//     passport.use(strategy);
//   }

//   passport.serializeUser((user: Express.User, cb) => cb(null, user));
//   passport.deserializeUser((user: Express.User, cb) => cb(null, user));

//   app.get("/api/login", (req, res, next) => {
//     passport.authenticate(`replitauth:${req.hostname}`, {
//       prompt: "login consent",
//       scope: ["openid", "email", "profile", "offline_access"],
//     })(req, res, next);
//   });

//   app.get("/api/callback", (req, res, next) => {
//     passport.authenticate(`replitauth:${req.hostname}`, {
//       successReturnToOrRedirect: "/",
//       failureRedirect: "/api/login",
//     })(req, res, next);
//   });

//   app.get("/api/logout", (req, res) => {
//     req.logout(() => {
//       res.redirect(
//         client.buildEndSessionUrl(config, {
//           client_id: process.env.REPL_ID!,
//           post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
//         }).href
//       );
//     });
//   });
// }

// export const isAuthenticated: RequestHandler = async (req, res, next) => {
//   const user = req.user as any;

//   if (!req.isAuthenticated() || !user.expires_at) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const now = Math.floor(Date.now() / 1000);
//   if (now <= user.expires_at) {
//     return next();
//   }

//   const refreshToken = user.refresh_token;
//   if (!refreshToken) {
//     res.status(401).json({ message: "Unauthorized" });
//     return;
//   }

//   try {
//     const config = await getOidcConfig();
//     const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
//     updateUserSession(user, tokenResponse);
//     return next();
//   } catch (error) {
//     res.status(401).json({ message: "Unauthorized" });
//     return;
//   }
// };
