import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Roles como enum (melhor para TS)
export enum ROLES {
  PLAYER = "player",
  SPECTATOR = "spectator",
  GAMEMASTER = "gameMaster",
}

// Interface para o User
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  appleId?: string;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const UserSchema: Schema<IUser> = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String },
  appleId: { type: String },
});

// Middleware para criptografar senha
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    console.log("Hashing password:", this.password);
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Método para comparar senha
UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export
export const User = mongoose.model<IUser>("User", UserSchema);
