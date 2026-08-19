import { StructuredOrderException } from './types';

export class OperationsWorker {
  /**
   * Analyzes delayed order tracking and formulates human recommendation (No auto refunds)
   */
  public async analyzeDelayedOrder(
    orderId: string,
    customerName: string,
    delayHours: number
  ): Promise<StructuredOrderException> {
    const severity = delayHours > 24 ? 'HIGH' : delayHours > 6 ? 'MEDIUM' : 'LOW';

    return {
      orderId,
      customerName,
      delayHours,
      severity,
      recommendedAction: 'Notify customer of transit delay and offer free express delivery voucher on next purchase.',
      draftCustomerMessage: `Hi ${customerName}, your Sareethi order (${orderId}) has been slightly delayed in transit by ${delayHours} hours. We sincerely apologize and are expediting delivery today.`,
    };
  }
}
