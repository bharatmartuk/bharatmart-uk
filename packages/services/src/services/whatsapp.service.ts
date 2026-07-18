import 'server-only'

/**
 * WhatsApp Business API stub.
 * TODO(Phase 22+): integrate Meta Cloud API after Business verification.
 * Do not block marketplace shipping on WhatsApp approval.
 */
export const WhatsAppService = {
  async sendTemplateMessage(_input: {
    to: string
    templateName: string
    variables?: Record<string, string>
  }): Promise<{ queued: false; reason: string }> {
    return {
      queued: false,
      reason: 'WhatsApp Business API not configured yet (pending Meta verification).',
    }
  },
}

export const whatsappService = WhatsAppService
