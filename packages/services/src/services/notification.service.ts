import 'server-only'

import { Resend } from 'resend'
import { prisma } from '@bharatmart/database'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function renderEmail(subject: string, bodyHtml: string) {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#fff8f0;padding:24px;color:#1e1b16">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d6c4ad;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;color:#7f5700;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:12px">BharatMart UK</p>
    <h1 style="color:#7f5700;font-size:20px;margin:0 0 12px">${subject}</h1>
    <div style="margin:0;line-height:1.6;color:#514534">${bodyHtml}</div>
  </div>
  </body></html>`
}

const orderStatusLabels: Record<string, string> = {
  PLACED: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const templates = {
  ORDER_CONFIRMATION: (orderNumber: string, trackHint?: string) => ({
    title: `Order ${orderNumber} confirmed`,
    body: `Thanks for shopping on BharatMart UK. Your merchants are preparing order <strong>${orderNumber}</strong>.${
      trackHint
        ? `<p style="margin:16px 0 0">Track your order anytime with your order number and email: <a href="${trackHint}">${trackHint}</a></p>`
        : ''
    }`,
  }),
  MERCHANT_APPROVED: (storeName: string) => ({
    title: 'Store approved',
    body: `<strong>${storeName}</strong> is now live on BharatMart UK. You can start listing products.`,
  }),
  MERCHANT_REJECTED: (storeName: string) => ({
    title: 'Store verification rejected',
    body: `<strong>${storeName}</strong> needs updates before it can go live. Please revise your documents and resubmit.`,
  }),
  ORDER_STATUS_CHANGED: (orderNumber: string, storeName: string, status: string) => {
    const label = orderStatusLabels[status] ?? status
    return {
      title: `Order ${orderNumber} is now ${label.toLowerCase()}`,
      body: `<strong>${storeName}</strong> updated your order to <strong>${label}</strong>.`,
    }
  },
  SUPPORT_REPLY: (ticketSubject: string) => ({
    title: 'New support reply',
    body: `There is a new reply on your support ticket: <strong>${ticketSubject}</strong>.`,
  }),
  NEW_ORDER: (orderId: string) => ({
    title: 'New order received',
    body: `Order <strong>${orderId}</strong> needs fulfilment in your merchant dashboard.`,
  }),
  VERIFY_EMAIL: (verifyUrl: string, name?: string) => ({
    title: 'Confirm your email address',
    body: `${name ? `Hi ${name}, ` : ''}welcome to BharatMart UK. Please confirm this email address so we can keep you updated about your orders.
      <p style="margin:20px 0"><a href="${verifyUrl}" style="display:inline-block;background:#7f5700;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Verify my email</a></p>
      <p style="margin:12px 0 0;font-size:13px;color:#837561">Or paste this link into your browser:<br /><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="margin:12px 0 0;font-size:13px;color:#837561">This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>`,
  }),
}

/**
 * NotificationService:
 * 1) always writes an in-app Notification row
 * 2) emails via Resend when RESEND_API_KEY is present
 */
export const NotificationService = {
  async notify(
    userId: string,
    type: string,
    data: { title: string; body: string },
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: data.title,
        body: data.body.replace(/<[^>]+>/g, ''),
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    const resend = getResend()
    if (resend && user?.email) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'BharatMart UK <onboarding@resend.dev>',
        to: user.email,
        subject: data.title,
        html: renderEmail(data.title, data.body),
      })
    }

    return notification
  },

  async notifyMerchantVerification(merchantId: string, status: 'APPROVED' | 'REJECTED') {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { userId: true, storeName: true },
    })
    if (!merchant) return null

    const template =
      status === 'APPROVED'
        ? templates.MERCHANT_APPROVED(merchant.storeName)
        : templates.MERCHANT_REJECTED(merchant.storeName)

    return this.notify(merchant.userId, `MERCHANT_${status}`, template)
  },

  async sendOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        guestEmail: true,
        guestFirstName: true,
        paymentMethod: true,
        totalInPence: true,
      },
    })
    if (!order) return

    const appUrl = (
      process.env.NEXT_PUBLIC_WEB_APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      ''
    ).replace(/\/$/, '')
    const trackUrl = appUrl ? `${appUrl}/orders/track` : undefined
    const greeting = order.guestFirstName ? `Hi ${order.guestFirstName}, ` : ''
    const total = `£${(order.totalInPence / 100).toFixed(2)}`
    const paymentLabel =
      order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on delivery' : 'Card'

    const template = {
      title: `Order ${order.orderNumber} confirmed`,
      body: `${greeting}thanks for shopping on BharatMart UK.
        <p style="margin:12px 0 0">Your order <strong>${order.orderNumber}</strong> (${total}, ${paymentLabel}) is confirmed and merchants are preparing it.</p>
        ${
          trackUrl
            ? `<p style="margin:16px 0 0">Track your order with your order number and the email used at checkout: <a href="${trackUrl}">${trackUrl}</a></p>`
            : `<p style="margin:16px 0 0">Track your order anytime with your order number and the email used at checkout.</p>`
        }`,
    }

    if (order.customerId) {
      await this.notify(order.customerId, 'ORDER_CONFIRMATION', template)
      return
    }
    if (order.guestEmail) {
      await this.sendEmail(order.guestEmail, template.title, template.body)
    }
  },

  async notifyMerchantNewOrder(merchantId: string, orderId: string): Promise<void> {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { userId: true },
    })
    if (!merchant) return
    await this.notify(merchant.userId, 'NEW_ORDER', templates.NEW_ORDER(orderId))
  },

  async notifyOrderStatusChanged(input: {
    customerId?: string | null
    guestEmail?: string | null
    orderNumber: string
    storeName: string
    status: string
  }): Promise<void> {
    const template = templates.ORDER_STATUS_CHANGED(
      input.orderNumber,
      input.storeName,
      input.status,
    )
    if (input.customerId) {
      await this.notify(input.customerId, 'ORDER_STATUS_CHANGED', template)
      return
    }
    if (input.guestEmail) {
      await this.sendEmail(input.guestEmail, template.title, template.body)
    }
  },

  async notifySupportReply(userId: string, ticketSubject: string): Promise<void> {
    await this.notify(userId, 'SUPPORT_REPLY', templates.SUPPORT_REPLY(ticketSubject))
  },

  async sendEmailVerification(
    to: string,
    verifyUrl: string,
    name?: string,
  ): Promise<void> {
    const template = templates.VERIFY_EMAIL(verifyUrl, name)
    await this.sendEmail(to, template.title, template.body)
  },

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const resend = getResend()
    if (!resend) {
      console.warn('[email] RESEND_API_KEY is not set — skipping email to', to)
      return
    }
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'BharatMart UK <onboarding@resend.dev>',
      to,
      subject,
      html: renderEmail(subject, body),
    })
    if (result.error) {
      console.error('[email] Resend failed for', to, result.error)
      throw new Error(result.error.message || 'Failed to send email.')
    }
  },
}

export const notificationService = NotificationService
