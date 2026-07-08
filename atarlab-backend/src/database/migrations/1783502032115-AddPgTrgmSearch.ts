import { MigrationInterface, QueryRunner } from 'typeorm';

/** Enables typo-tolerant search: pg_trgm's similarity() lets SearchService fall back
 *  to fuzzy matching when a plain ILIKE finds nothing (e.g. "atarr" still finding "attar"). */
export class AddPgTrgmSearch1783502032115 implements MigrationInterface {
  name = 'AddPgTrgmSearch1783502032115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_name_trgm" ON "products" USING gin ("name" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_name_trgm" ON "categories" USING gin ("name" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brands_name_trgm" ON "brands" USING gin ("name" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_brands_name_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_name_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_name_trgm"`);
  }
}
