import express from "express";
import passport from "passport";
import { AuthController } from "../../interfaces/controllers/AuthController";

const router = express.Router();

// Auth routes
router.post("/signup", AuthController.signUp);
router.post("/signin", AuthController.signIn);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password/:token", AuthController.resetPassword);

// // Google OAuth
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// router.get("/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     const token = req.user ? (req.user as any)._id : "";
//     res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
//   }
// );

// // Apple OAuth
// router.get("/apple", passport.authenticate("apple"));
// router.post("/apple/callback",
//   passport.authenticate("apple", { failureRedirect: "/login" }),
//   (req, res) => {
//     const token = req.user ? (req.user as any)._id : "";
//     res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
//   }
// );

export default router;
