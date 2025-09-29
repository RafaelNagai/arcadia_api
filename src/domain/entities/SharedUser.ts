import { ROLES } from "../../infrastructure/database/mongoose/User";


export interface SharedUser {
  userId: string;        // ID do User
  role: ROLES;
}
