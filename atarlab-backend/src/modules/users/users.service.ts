import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        passwordHash: true,
        fullName: true,
        avatarUrl: true,
        googleId: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { phone } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  async createLocal(params: {
    email?: string;
    phone?: string;
    fullName: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await argon2.hash(params.password);
    const user = this.userRepo.create({
      email: params.email ?? null,
      phone: params.phone ?? null,
      fullName: params.fullName,
      passwordHash,
    });
    return this.userRepo.save(user);
  }

  async createFromGoogle(params: {
    email: string;
    fullName: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<User> {
    const user = this.userRepo.create({
      email: params.email,
      fullName: params.fullName,
      googleId: params.googleId,
      avatarUrl: params.avatarUrl ?? null,
      emailVerifiedAt: new Date(),
    });
    return this.userRepo.save(user);
  }

  async linkGoogleAccount(user: User, googleId: string, avatarUrl?: string): Promise<User> {
    user.googleId = googleId;
    if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
    if (!user.emailVerifiedAt) user.emailVerifiedAt = new Date();
    return this.userRepo.save(user);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.userRepo.update(userId, { emailVerifiedAt: new Date() });
  }

  async markPhoneVerified(userId: string): Promise<void> {
    await this.userRepo.update(userId, { phoneVerifiedAt: new Date() });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.getOrThrow(userId);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const target = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!target?.passwordHash) {
      throw new BadRequestException('This account has no password set (social login only)');
    }
    const valid = await argon2.verify(target.passwordHash, dto.currentPassword);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    target.passwordHash = await argon2.hash(dto.newPassword);
    await this.userRepo.save(target);
  }

  async setPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await argon2.hash(newPassword);
    await this.userRepo.update(userId, { passwordHash });
  }

  async findAllAdmin(pagination: PaginationDto): Promise<PaginatedResult<User>> {
    const [items, total] = await this.userRepo.findAndCount({
      skip: pagination.skip,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async setActiveStatus(userId: string, isActive: boolean): Promise<User> {
    const user = await this.getOrThrow(userId);
    user.isActive = isActive;
    return this.userRepo.save(user);
  }

  private async getOrThrow(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
