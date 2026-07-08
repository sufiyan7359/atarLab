import { DataSource } from 'typeorm';
import { DeliveryAgent } from '../../modules/delivery/entities/delivery-agent.entity';

const AGENTS: Array<{ name: string; phone: string; vehicleNumber: string }> = [
  { name: 'Ramesh Kumar', phone: '9876543210', vehicleNumber: 'MH-01-AB-1234' },
  { name: 'Suresh Patil', phone: '9876543211', vehicleNumber: 'MH-02-CD-5678' },
  { name: 'Vikram Singh', phone: '9876543212', vehicleNumber: 'MH-03-EF-9012' },
];

export async function seedDeliveryAgents(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(DeliveryAgent);
  let created = 0;
  for (const a of AGENTS) {
    const existing = await repo.findOne({ where: { phone: a.phone } });
    if (existing) continue;
    await repo.save(repo.create(a));
    created += 1;
  }
  console.log(`Seeded ${created} new delivery agents.`);
}
