/*
  Warnings:

  - Added the required column `phone` to the `whatsapp_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `whatsapp_sessions` ADD COLUMN `phone` VARCHAR(191) NOT NULL;
