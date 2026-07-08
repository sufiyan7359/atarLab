import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2AdminModules1783459240732 implements MigrationInterface {
  name = 'Phase2AdminModules1783459240732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_user_id" uuid, "action" character varying(100) NOT NULL, "entity_type" character varying(50) NOT NULL, "entity_id" uuid, "before" jsonb, "after" jsonb, "ip" character varying(45), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09121048ab4513dbd4545074ce" ON "activity_logs"  ("entity_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd64e0e98220d39e897f3d3e3e" ON "activity_logs"  ("entity_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "banners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(150), "image_url" character varying(500) NOT NULL, "link_url" character varying(500), "position" character varying(20) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "starts_at" TIMESTAMP WITH TIME ZONE, "ends_at" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(150) NOT NULL, "description" character varying(500), "banner_image" character varying(500), "discount_type" character varying(10) NOT NULL, "discount_value" numeric(10,2) NOT NULL, "category_id" uuid, "brand_id" uuid, "product_id" uuid, "starts_at" TIMESTAMP WITH TIME ZONE, "ends_at" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("key" character varying(100) NOT NULL, "value" jsonb NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD CONSTRAINT "FK_c29be5a121446eff251fa05d0ec" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_05ce793b33cbb292cfe94c00fd2" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_6ac902c483a49d5d6fe118e7a3d" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_07d9a626265f252fc5c743c42b5" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_07d9a626265f252fc5c743c42b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_6ac902c483a49d5d6fe118e7a3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_05ce793b33cbb292cfe94c00fd2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_c29be5a121446eff251fa05d0ec"`,
    );
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TABLE "banners"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd64e0e98220d39e897f3d3e3e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09121048ab4513dbd4545074ce"`,
    );
    await queryRunner.query(`DROP TABLE "activity_logs"`);
  }
}
