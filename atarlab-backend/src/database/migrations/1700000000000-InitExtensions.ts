import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitExtensions1700000000000 implements MigrationInterface {
  name = 'InitExtensions1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);
  }

  public async down(): Promise<void> {
    // Extensions are left in place intentionally — other objects may depend on them.
  }
}
