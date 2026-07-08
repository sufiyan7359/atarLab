export interface JwtPayload {
  sub: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface RequestUser {
  id: string;
  roles: string[];
}
