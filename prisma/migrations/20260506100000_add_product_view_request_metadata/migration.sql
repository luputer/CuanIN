-- Store non-sensitive request metadata for product view analytics.
ALTER TABLE "ProductView" ADD COLUMN "ipHash" TEXT;
ALTER TABLE "ProductView" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "ProductView" ADD COLUMN "browser" TEXT;
ALTER TABLE "ProductView" ADD COLUMN "os" TEXT;
ALTER TABLE "ProductView" ADD COLUMN "device" TEXT;

CREATE INDEX "ProductView_ipHash_idx" ON "ProductView"("ipHash");
CREATE INDEX "ProductView_browser_idx" ON "ProductView"("browser");
CREATE INDEX "ProductView_device_idx" ON "ProductView"("device");
