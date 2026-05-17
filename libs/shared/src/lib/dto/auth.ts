import { UserProfile } from './user.js';

export interface AuthSuccessResponse {
  message?: string;
  user?: UserProfile;
}
