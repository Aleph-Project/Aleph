export interface Auth0JwtPayload {
  sub: string;
  name?: string;
  email?: string;
  exp: number;
  [key: string]: any;
}