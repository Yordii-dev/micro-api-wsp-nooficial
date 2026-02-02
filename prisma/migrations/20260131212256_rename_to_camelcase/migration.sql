/*
  Warnings:

  - You are about to drop the column `sessionName` on the `whatsapp_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionState` on the `whatsapp_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `whatsapp_sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[session_name]` on the table `whatsapp_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identification` to the `whatsapp_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_name` to the `whatsapp_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `whatsapp_sessions_sessionName_key` ON `whatsapp_sessions`;

-- AlterTable
ALTER TABLE `whatsapp_sessions` DROP COLUMN `sessionName`,
    DROP COLUMN `sessionState`,
    DROP COLUMN `userId`,
    ADD COLUMN `identification` INTEGER NOT NULL,
    ADD COLUMN `session_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `session_state` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `whatsapp_sessions_session_name_key` ON `whatsapp_sessions`(`session_name`);
