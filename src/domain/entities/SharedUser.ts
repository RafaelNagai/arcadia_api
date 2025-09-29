import { ROLES } from "../../infrastructure/database/mongoose/UserSchema";


export interface SharedUser {
  userId: string;        // ID do User
  role: ROLES;
}
