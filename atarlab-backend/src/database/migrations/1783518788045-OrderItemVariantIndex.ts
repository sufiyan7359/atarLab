import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderItemVariantIndex1783518788045 implements MigrationInterface {
  name = 'OrderItemVariantIndex1783518788045';

  // migration:generate also proposed dropping the pg_trgm GIN indexes again (same false
  // positive as the WishlistPriceAtAdd migration — not expressible via @Index() metadata).
  // Left out; still required by SearchService's fuzzy fallback.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_db2d0ea722e16e0fe8ab3bce11" ON "order_items"  ("variant_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db2d0ea722e16e0fe8ab3bce11"`,
    );
  }
}
