import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActionStateColumn1758251559328 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if state column exists
    const hasStateColumn = await queryRunner.hasColumn('actions', 'state');

    if (!hasStateColumn) {
      // Add state column as nullable first
      await queryRunner.query(
        `ALTER TABLE "actions" ADD "state" character varying(255)`,
      );

      // Update existing records with default value
      await queryRunner.query(
        `UPDATE "actions" SET "state" = 'inactive' WHERE "state" IS NULL`,
      );

      // Make the column NOT NULL
      await queryRunner.query(
        `ALTER TABLE "actions" ALTER COLUMN "state" SET NOT NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasStateColumn = await queryRunner.hasColumn('actions', 'state');

    if (hasStateColumn) {
      await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "state"`);
    }
  }
}
