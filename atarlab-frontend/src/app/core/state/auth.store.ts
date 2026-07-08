import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _initialized = signal(false);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken() && !!this._user());

  setSession(accessToken: string, user: User): void {
    this._accessToken.set(accessToken);
    this._user.set(user);
    this._initialized.set(true);
  }

  updateUser(user: User): void {
    this._user.set(user);
  }

  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
  }

  markInitialized(): void {
    this._initialized.set(true);
  }

  clear(): void {
    this._accessToken.set(null);
    this._user.set(null);
    this._initialized.set(true);
  }

  hasRole(...roles: string[]): boolean {
    const user = this._user();
    if (!user) return false;
    return user.roles.some((r) => roles.includes(r.name));
  }
}
