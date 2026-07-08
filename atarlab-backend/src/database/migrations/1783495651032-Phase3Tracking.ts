import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase3Tracking1783495651032 implements MigrationInterface {
  name = 'Phase3Tracking1783495651032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "delivery_agents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "phone" character varying(20) NOT NULL, "vehicle_number" character varying(20), "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_a7c2106d5b7261ca0afd794366c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_id" uuid NOT NULL, "agent_id" uuid, "current_lat" double precision, "current_lng" double precision, "destination_lat" double precision, "destination_lng" double precision, "eta_minutes" integer, "assigned_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5b7398f333a716f83e82d8679d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cdaeaafd545a83793ca571d3c8" ON "order_deliveries"  ("order_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "type" character varying(30) NOT NULL DEFAULT 'ORDER_STATUS', "title" character varying(150) NOT NULL, "message" character varying(300) NOT NULL, "order_id" uuid, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications"  ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "order_deliveries" ADD CONSTRAINT "FK_cdaeaafd545a83793ca571d3c89" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_deliveries" ADD CONSTRAINT "FK_73124c3b186d414c4b20ed711bb" FOREIGN KEY ("agent_id") REFERENCES "delivery_agents"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_deliveries" DROP CONSTRAINT "FK_73124c3b186d414c4b20ed711bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_deliveries" DROP CONSTRAINT "FK_cdaeaafd545a83793ca571d3c89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cdaeaafd545a83793ca571d3c8"`,
    );
    await queryRunner.query(`DROP TABLE "order_deliveries"`);
    await queryRunner.query(`DROP TABLE "delivery_agents"`);
  }
}
