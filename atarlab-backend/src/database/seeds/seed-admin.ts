import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles-permissions/entities/role.entity';
import { RoleName } from '../../common/enums';

const ADMIN_EMAIL = 'admin@atarlab.com';
const ADMIN_PASSWORD = 'Admin@12345';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const superAdminRole = await roleRepo.findOne({ where: { name: RoleName.SUPER_ADMIN } });
  if (!superAdminRole) {
    console.warn('SUPER_ADMIN role not found — run seedRoles first. Skipping admin seed.');
    return;
  }

  let admin = await userRepo.findOne({ where: { email: ADMIN_EMAIL }, relations: { roles: true } });
  if (!admin) {
    admin = userRepo.create({
      email: ADMIN_EMAIL,
      fullName: 'AtarLab Admin',
      passwordHash: await argon2.hash(ADMIN_PASSWORD),
      emailVerifiedAt: new Date(),
      roles: [superAdminRole],
    });
  } else if (!admin.roles.some((r) => r.name === RoleName.SUPER_ADMIN)) {
    admin.roles = [...admin.roles, superAdminRole];
  }
  await userRepo.save(admin);

  console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (change this password in any shared environment).`);
}
