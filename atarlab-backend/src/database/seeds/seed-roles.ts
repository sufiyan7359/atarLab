import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles-permissions/entities/role.entity';
import { Permission } from '../../modules/roles-permissions/entities/permission.entity';
import { RoleName } from '../../common/enums';

const PERMISSIONS: Array<{ name: string; module: string }> = [
  { name: 'products.create', module: 'products' },
  { name: 'products.update', module: 'products' },
  { name: 'products.delete', module: 'products' },
  { name: 'orders.view_all', module: 'orders' },
  { name: 'orders.update_status', module: 'orders' },
  { name: 'orders.refund', module: 'orders' },
  { name: 'coupons.manage', module: 'coupons' },
  { name: 'customers.manage', module: 'customers' },
  { name: 'reviews.moderate', module: 'reviews' },
  { name: 'reports.view', module: 'reports' },
  { name: 'settings.manage', module: 'settings' },
];

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [RoleName.SUPER_ADMIN]: PERMISSIONS.map((p) => p.name),
  [RoleName.ADMIN]: PERMISSIONS.map((p) => p.name),
  [RoleName.STAFF]: [
    'orders.view_all',
    'orders.update_status',
    'reviews.moderate',
  ],
  [RoleName.CUSTOMER]: [],
};

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);

  const permissionsByName = new Map<string, Permission>();
  for (const p of PERMISSIONS) {
    let permission = await permissionRepo.findOne({ where: { name: p.name } });
    permission ??= await permissionRepo.save(permissionRepo.create(p));
    permissionsByName.set(p.name, permission);
  }

  for (const roleName of Object.values(RoleName)) {
    let role = await roleRepo.findOne({
      where: { name: roleName },
      relations: { permissions: true },
    });
    const permissions = (ROLE_PERMISSIONS[roleName] ?? [])
      .map((name) => permissionsByName.get(name))
      .filter((p): p is Permission => !!p);

    if (!role) {
      role = roleRepo.create({ name: roleName, permissions });
    } else {
      role.permissions = permissions;
    }
    await roleRepo.save(role);
  }

  console.log(
    `Seeded ${PERMISSIONS.length} permissions and ${Object.values(RoleName).length} roles.`,
  );
}
