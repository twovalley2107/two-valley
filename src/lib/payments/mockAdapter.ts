import { PaymentAdapter, PaymentInitParams, PaymentInitResult, PaymentWebhookPayload } from "./types";

/**
 * MockPaymentAdapter: Standard provider-neutral mock adapter for local testing and MVP execution.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  public providerName = "mock_provider";

  async createPaymentSession(params: PaymentInitParams): Promise<PaymentInitResult> {
    const transactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const redirectUrl = `/checkout/confirmation?orderNumber=${encodeURIComponent(params.orderNumber)}&txn=${transactionId}`;

    return {
      transactionId,
      redirectUrl,
      clientToken: `token_mock_${params.orderId}`,
      provider: this.providerName,
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
    if (!signature) return false;
    // For mock testing: Accept valid secret header or mock signature
    const mockSecret = process.env.PAYMENT_WEBHOOK_SECRET || "mock_webhook_secret_key";
    return signature === mockSecret || signature === "valid_mock_signature";
  }

  parseWebhookPayload(body: unknown): PaymentWebhookPayload {
    const payload = body as Record<string, unknown>;
    return {
      orderId: String(payload.orderId || ""),
      orderNumber: String(payload.orderNumber || ""),
      status: payload.status === "FAILED" ? "FAILED" : "PAID",
      transactionId: String(payload.transactionId || `txn_wh_${Date.now()}`),
    };
  }
}

export const mockPaymentAdapter = new MockPaymentAdapter();
