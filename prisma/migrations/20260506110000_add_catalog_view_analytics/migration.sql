-- Track visits to a creator's public catalog page.
CREATE TABLE "CatalogView" (
    "id" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visitorId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CatalogView_catalogId_idx" ON "CatalogView"("catalogId");
CREATE INDEX "CatalogView_userId_idx" ON "CatalogView"("userId");
CREATE INDEX "CatalogView_visitorId_idx" ON "CatalogView"("visitorId");
CREATE INDEX "CatalogView_ipHash_idx" ON "CatalogView"("ipHash");
CREATE INDEX "CatalogView_browser_idx" ON "CatalogView"("browser");
CREATE INDEX "CatalogView_device_idx" ON "CatalogView"("device");
CREATE INDEX "CatalogView_userId_visitorId_idx" ON "CatalogView"("userId", "visitorId");
CREATE INDEX "CatalogView_createdAt_idx" ON "CatalogView"("createdAt");

ALTER TABLE "CatalogView" ADD CONSTRAINT "CatalogView_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "Catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CatalogView" ADD CONSTRAINT "CatalogView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
