import mongoose, { Schema, Document, Types } from "mongoose";
import { ROLES } from "./UserSchema";

export interface ISharedUser {
  userId: Types.ObjectId;  // aqui usamos Types.ObjectId
  role: ROLES;
}

const SharedUserSchema = new Schema<ISharedUser>(
  {
    userId: {
      type: Schema.Types.ObjectId, // correto
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.SPECTATOR,
      required: true,
    },
  },
  { _id: false }
);

export { SharedUserSchema };
