import 'dotenv/config';
import dataSource from '../data-source';
import { seedRoles } from './seed-roles';
import { seedCatalog } from './seed-catalog';
import { seedAdmin } from './seed-admin';
import { seedBanners } from './seed-banners';
import { seedDeliveryAgents } from './seed-delivery-agents';
import { seedContent } from './seed-content';

async function run() {
  await dataSource.initialize();
  try {
    await seedRoles(dataSource);
    await seedCatalog(dataSource);
    await seedAdmin(dataSource);
    await seedBanners(dataSource);
    await seedDeliveryAgents(dataSource);
    await seedContent(dataSource);
    console.log('Seeding completed successfully.');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
