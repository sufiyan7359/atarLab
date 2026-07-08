import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesPermissionsService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async getPermissionsForRoles(roleNames: string[]): Promise<Set<string>> {
    if (!roleNames?.length) return new Set();
    const roles = await this.roleRepo.find({
      where: { name: In(roleNames) as never },
      relations: { permissions: true },
    });
    const permissions = new Set<string>();
    for (const role of roles) {
      for (const permission of role.permissions ?? []) {
        permissions.add(permission.name);
      }
    }
    return permissions;
  }

  findAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({
      relations: { permissions: true },
      order: { name: 'ASC' },
    });
  }

  findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { module: 'ASC', name: 'ASC' } });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const permissions = dto.permissionIds?.length
      ? await this.permissionRepo.find({ where: { id: In(dto.permissionIds) } })
      : [];
    const role = this.roleRepo.create({
      name: dto.name as never,
      description: dto.description ?? null,
      permissions,
    });
    return this.roleRepo.save(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);
    if (dto.name !== undefined) role.name = dto.name as never;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds.length
        ? await this.permissionRepo.find({
            where: { id: In(dto.permissionIds) },
          })
        : [];
    }
    return this.roleRepo.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);
    await this.roleRepo.remove(role);
  }
}
