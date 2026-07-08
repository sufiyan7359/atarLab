export interface Role {
  id: string;
  name: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  isActive: boolean;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
