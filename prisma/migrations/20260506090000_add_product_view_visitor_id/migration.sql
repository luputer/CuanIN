-- Add anonymous visitor tracking for product views.
ALTER TABLE "ProductView" ADD COLUMN "visitorId" TEXT;

CREATE INDEX "ProductView_visitorId_idx" ON "ProductView"("visitorId");
CREATE INDEX "ProductView_productId_visitorId_idx" ON "ProductView"("productId", "visitorId");
