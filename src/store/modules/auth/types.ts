export interface AuthState {
  token: string;
  refreshToken: string;
  tokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}
