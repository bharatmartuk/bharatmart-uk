import { createMerchantPortalMiddleware } from '@bharatmart/auth/middleware'

export default createMerchantPortalMiddleware()

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
