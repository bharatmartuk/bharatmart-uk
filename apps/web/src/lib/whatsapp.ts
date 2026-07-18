/**
 * Builds a WhatsApp click-to-chat URL.
 * Merchant.whatsAppNumber is not in the Phase 13 schema yet, so callers should
 * pass Merchant.user.phone (or a future dedicated field) as `phone`.
 */
export function buildWhatsAppLink(phone: string | null | undefined, message: string) {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
