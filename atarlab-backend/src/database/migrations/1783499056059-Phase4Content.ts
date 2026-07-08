import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase4Content1783499056059 implements MigrationInterface {
  name = 'Phase4Content1783499056059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "newsletter_subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" citext NOT NULL, CONSTRAINT "PK_38f9333e9961b2fdb589128d19b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0dc48416511f011f7de7b2a8f8" ON "newsletter_subscribers"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "social_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "image_url" character varying(500) NOT NULL, "caption" character varying(300), "link_url" character varying(500), "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_2161864ea79f14525b8804bd7ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "faq_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "question" character varying(300) NOT NULL, "answer" text NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_72fbce3e53149fa821abbf674ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blog_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(200) NOT NULL, "slug" character varying(220) NOT NULL, "excerpt" character varying(300) NOT NULL, "content" text NOT NULL, "cover_image_url" character varying(500), "author_name" character varying(150) NOT NULL DEFAULT 'AtarLab Team', "is_published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b2818a2c45c3edb9991b1c7a5" ON "blog_posts"  ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "testimonials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "author_name" character varying(150) NOT NULL, "quote" character varying(500) NOT NULL, "rating" smallint NOT NULL DEFAULT '5', "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_63b03c608bd258f115a0a4a1060" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "testimonials"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b2818a2c45c3edb9991b1c7a5"`,
    );
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TABLE "faq_items"`);
    await queryRunner.query(`DROP TABLE "social_posts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0dc48416511f011f7de7b2a8f8"`,
    );
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
  }
}
