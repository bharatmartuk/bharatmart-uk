import { createRoleGuardMiddleware } from '@bharatmart/auth/middleware'
import { UserRole } from '@bharatmart/types'

export default createRoleGuardMiddleware([UserRole.ADMIN])

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
