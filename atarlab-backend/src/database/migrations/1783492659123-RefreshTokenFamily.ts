import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokenFamily1783492659123 implements MigrationInterface {
    name = 'RefreshTokenFamily1783492659123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Nullable first so existing rows don't violate NOT NULL, then backfill each existing
        // token as the root of its own family (we don't know their true lineage), then enforce it.
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "family_id" uuid`);
        await queryRunner.query(`UPDATE "refresh_tokens" SET "family_id" = "id" WHERE "family_id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "family_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "replaced_by_token_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_d5e27da0cd39bc3bb2811fc8ba" ON "refresh_tokens"  ("family_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d5e27da0cd39bc3bb2811fc8ba"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "replaced_by_token_id"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "family_id"`);
    }

}
