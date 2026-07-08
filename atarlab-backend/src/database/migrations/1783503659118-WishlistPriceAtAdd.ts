import { MigrationInterface, QueryRunner } from "typeorm";

export class WishlistPriceAtAdd1783503659118 implements MigrationInterface {
    name = 'WishlistPriceAtAdd1783503659118'

    // Note: migration:generate also proposed dropping the pg_trgm GIN indexes from the
    // previous migration — a false positive, since those use gin_trgm_ops which isn't
    // expressible via TypeORM's @Index() metadata, so its schema diff sees them as
    // "extra". Left out here; they're still required by SearchService's fuzzy fallback.
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlists" ADD "price_at_add" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlists" DROP COLUMN "price_at_add"`);
    }

}
