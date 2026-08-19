import { StructuredCustomerFollowup } from './types';

export class CustomerWorker {
  /**
   * Analyzes customer purchase interval velocity and generates re-engagement draft
   */
  public async evaluateFollowupOpportunity(
    customerId: string,
    customerName: string,
    daysSinceLastPurchase: number,
    avgIntervalDays: number = 30
  ): Promise<StructuredCustomerFollowup> {
    const evidence = `Customer ${customerName} last purchased ${daysSinceLastPurchase} days ago against average buying interval of ${avgIntervalDays} days.`;

    const suggestedMessage = `Hi ${customerName}, we noticed you enjoyed our festive saree collection! We've just added new Banarsi and Chanderi silk arrivals that you might love.`;

    return {
      customerId,
      customerName,
      daysSinceLastPurchase,
      avgIntervalDays,
      suggestedMessage,
      evidence,
    };
  }
}
