import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserModel } from "../../infrastructure/database/mongoose/UserSchema";
import sendEmail from "../../infrastructure/services/EmailSender";

export class AuthService {
  static generateToken(payload: object): String {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1h" });
  }

  static async signUp(username: string, email: string, password: string) {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new Error("Email already in use.");

    const user = new UserModel({ username, email, password });
    const newUser = await user.save();

    const token = AuthService.generateToken({ id: newUser.id, username: newUser.username });

    return { token, email, username: user.username, id: user._id };
  }

  static async signIn(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid credentials.");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials.");

    const token = AuthService.generateToken({ id: user._id, username: user.username });

    return { token, email, username: user.username, id: user._id };
  }

  static async forgotPassword(email: string, frontendUrl: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found.");

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);;
    await user.save();

    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Redefinição de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Para prosseguir, clique no botão abaixo para criar uma nova senha:</p>
        <div style="margin: 20px 0;">
          <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
        </div>
        <p>O link de redefinição de senha é válido por 1 hora.</p>
        <p>Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Sua equipe de suporte</p>
      </div>
    `;
    console.log("HTML Message:", htmlMessage); // Para fins de depuração

    await sendEmail({ email: user.email, subject: "Password Reset", html: htmlMessage });

    return { message: "Email sent successfully!" };
  }

  static async resetPassword(token: string, newPassword: string) {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid or expired token.");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: "Password reset successful!" };
  }
}
