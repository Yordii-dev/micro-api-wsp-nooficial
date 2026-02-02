/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `whatsapp_sessions` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `whatsapp_sessions` DROP COLUMN `phoneNumber`;

-- DropTable
DROP TABLE `roles`;
