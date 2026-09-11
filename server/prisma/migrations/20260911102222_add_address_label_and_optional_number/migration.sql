ALTER TABLE "addresses" ADD COLUMN "label" TEXT;
ALTER TABLE "addresses" ALTER COLUMN "number" DROP NOT NULL;
