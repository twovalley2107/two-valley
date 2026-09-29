/**
 * Provider-Neutral Payment Adapter Interfaces per ARCHITECTURE.md Section 8 and TV-10-001.
 */

export interface PaymentInitParams {
  orderId: string;
  orderNumber: string;
  amountInCents: number; // Exact integer smallest currency unit (e.g. $150.50 -> 15050)
  currency: string;
  customerEmail: string;
  returnUrl: string;
}

export interface PaymentInitResult {
  transactionId: string;
  redirectUrl?: string;
  clientToken?: string;
  provider: string;
}

export interface PaymentWebhookPayload {
  orderId: string;
  orderNumber: string;
  status: "PAID" | "FAILED";
  transactionId: string;
}

export interface PaymentAdapter {
  providerName: string;
  createPaymentSession(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
  parseWebhookPayload(body: unknown): PaymentWebhookPayload;
}
