/**
 * Auth Domain Types
 * Commands, DTOs, and responses for authentication
 */

/** Command for registering a new user */
export interface RegisterUserCommand {
  email: string;
  role: string;
}

/** Command for user login */
export interface LoginUserCommand {
  email: string;
  password: string;
}

/** User DTO from Supabase Auth */
export interface UserDTO {
  id: string;
  email: string;
  role?: string;
}
