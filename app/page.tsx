import { AnnouncementBar } from "@/components/shop/announcement-bar"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { Catalog } from "@/components/shop/catalog"
import { MobileBar, WhatsAppConcierge } from "@/components/shop/floating-actions"
import { GiftFinder } from "@/components/shop/gift-finder"
import { Hero } from "@/components/shop/hero"
import { ProductModal } from "@/components/shop/product-modal"
import { SiteFooter } from "@/components/shop/site-footer"
import { SiteHeader } from "@/components/shop/site-header"
import { StorefrontUIProvider } from "@/components/shop/storefront-ui"
import { TrustStrip } from "@/components/shop/trust-strip"
import { WishlistDrawer } from "@/components/shop/wishlist-drawer"

export default function Home() {
  return (
    <StorefrontUIProvider>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <TrustStrip />
        <Catalog />
        <GiftFinder />
      </main>
      <SiteFooter />
      <WhatsAppConcierge />
      <MobileBar />
      <ProductModal />
      <CartDrawer />
      <WishlistDrawer />
    </StorefrontUIProvider>
  )
}
